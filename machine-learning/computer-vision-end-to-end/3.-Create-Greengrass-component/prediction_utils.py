import ast
import datetime
import io
import json
import os
import platform
import sys
import time
from math import floor
import random
import config_utils
import cv2
import IPCUtils as ipc_utils
import numpy as np
import tflite_runtime.interpreter as tflite
from getraspipos import damepos
from gps import *

config_utils.logger.info("Using tflite from '{}'.".format(sys.modules[tflite.__package__].__file__))
config_utils.logger.info("Using np from '{}'.".format(np.__file__))
config_utils.logger.info("Using cv2 from '{}'.".format(cv2.__file__))
gpsd = gps(mode=WATCH_ENABLE|WATCH_NEWSTYLE)



# Read labels file
labels_path = os.path.join(config_utils.MODEL_DIR, "labels.txt")
with open(labels_path, "r") as f:
    labels = ast.literal_eval(f.read())
try:
    interpreter = tflite.Interpreter(
        model_path=os.path.join(config_utils.MODEL_DIR, "model.tflite")
    )
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
except Exception as e:
    config_utils.logger.info("Exception occured during the allocation of tensors: {}".format(e))
    exit(1)


def getPositionData():
    # captures de GPS coordinates from Raspberry Pi 
    nx = gpsd.next()
    
    # For a list of all supported classes and fields refer to:
    # https://gpsd.gitlab.io/gpsd/gpsd_json.html
    if nx['class'] == 'TPV':
        latitude = getattr(nx,'lat', "Unknown")
        longitude = getattr(nx,'lon', "Unknown")
        print ("Your position: lon = " + str(longitude) + ", lat = " + str(latitude))
        MESSAGEE = {"latitude": str(latitude), "longitude": str(longitude)}
        return MESSAGEE
    else:
        MESSAGEE = {"latitude": "NA", "longitude": "NA"}
        return MESSAGEE

def predict_from_cam():
    r"""
    Captures an image using camera and sends it for prediction
    """
    cvimage = None
    if config_utils.CAMERA is None:
        config_utils.logger.error("Unable to support camera.")
        exit(1)
    if platform.machine() == "armv7l":  # RaspBerry Pi
        stream = io.BytesIO()
        config_utils.CAMERA.start_preview()
        time.sleep(2)
        config_utils.CAMERA.capture(stream, format="jpeg")
        # Construct a numpy array from the stream
        data = np.fromstring(stream.getvalue(), dtype=np.uint8)
        # "Decode" the image from the array, preserving colour
        cvimage = cv2.imdecode(data, 1)
    elif platform.machine() == "aarch64":  # Nvidia Jetson Nano
        if config_utils.CAMERA.isOpened():
            ret, cvimage = config_utils.CAMERA.read()
            cv2.destroyAllWindows()
        else:
            raise RuntimeError("Cannot open the camera")
    elif platform.machine() == "x86_64":  # Deeplens
        ret, cvimage = config_utils.CAMERA.getLastFrame()
        if ret == False:
            raise RuntimeError("Failed to get frame from the stream")
    if cvimage is not None:
        return predict_from_image(cvimage)
    else:
        config_utils.logger.error("Unable to capture an image using camera")
        exit(1)


def load_image(image_path):
    r"""
    Validates the image type irrespective of its case. For eg. both .PNG and .png are valid image types.
    Also, accepts numpy array images.

    :param image_path: path of the image on the device.
    :return: a numpy array of shape (1, input_shape_x, input_shape_y, no_of_channels)
    """
    # Case insenstive check of the image type.
    img_lower = image_path.lower()
    if (
        img_lower.endswith(
            ".jpg",
            -4,
        )
        or img_lower.endswith(
            ".png",
            -4,
        )
        or img_lower.endswith(
            ".jpeg",
            -5,
        )
    ):
        try:
            image_data = cv2.imread(image_path)
        except Exception as e:
            config_utils.logger.error(
                "Unable to read the image at: {}. Error: {}".format(image_path, e)
            )
            exit(1)
    elif img_lower.endswith(
        ".npy",
        -4,
    ):
        image_data = np.load(image_path)
    else:
        config_utils.logger.error("Images of format jpg,jpeg,png and npy are only supported.")
        exit(1)
    return image_data


def predict_from_image(image):
    r"""
    Resize the image to the trained model input shape and predict using it.

    :param image: numpy array of the image passed in for inference
    """
    cvimage = cv2.resize(image, config_utils.SHAPE)
    inference_results = predict(cvimage)
    draw_bounding_boxes(image, inference_results)


def enable_camera():
    r"""
    Checks of the supported device types and access the camera accordingly.
    """
    if platform.machine() == "armv7l":  # RaspBerry Pi
        import picamera

        config_utils.CAMERA = picamera.PiCamera()
    elif platform.machine() == "aarch64":  # Nvidia Jetson TX
        config_utils.CAMERA = cv2.VideoCapture(0)
            
    elif platform.machine() == "x86_64":  # Deeplens
        import awscam

        config_utils.CAMERA = awscam


def predict(image_data):
    r"""
    Performs object detection and predicts using the model.

    :param image_data: numpy array of the resized image passed in for inference.
    :return: JSON object of inference results
    """
        
       
    
    
    PAYLOAD = {}
    PAYLOAD["timestamp"] = str(datetime.datetime.now())
    PAYLOAD["inferencetype"] = "object-detection"
    PAYLOAD["inferencedescription"] = "Top {} predictions with score {} or above ".format(
        config_utils.MAX_NO_OF_RESULTS, config_utils.SCORE_THRESHOLD
    )
        
    PAYLOAD["inferenceresults"] = []
    
    
    try:
        image_data = np.expand_dims(image_data, axis=0).astype(np.uint8)
        interpreter.set_tensor(input_details[0]["index"], image_data)
        interpreter.invoke()
        boxes = interpreter.get_tensor(output_details[0]["index"])[0]
        classes = interpreter.get_tensor(output_details[1]["index"])[0]
        scores = interpreter.get_tensor(output_details[2]["index"])[0]
        predicted = []
        
        for i in range(len(scores)):
            c = int(classes[i])
            if len(predicted) == config_utils.MAX_NO_OF_RESULTS:
                break
            if scores[i] >= config_utils.SCORE_THRESHOLD:
                predicted.append(c)
                result = {
                    "Label": str(labels[c]),
                    "Score": str(scores[i]),
                    "Boundaries": str(boxes[i]),
                }
                PAYLOAD["inferenceresults"].append(result)
        config_utils.logger.info(json.dumps(PAYLOAD))
               
        PAYLOAD["position"] = getPositionData()
                
        if config_utils.TOPIC.strip() != "":
            ipc_utils.IPCUtils().publish_results_to_cloud(PAYLOAD)
        else:
            config_utils.logger.info("No topic set to publish the inference results to the cloud.")            
        return PAYLOAD["inferenceresults"]
    except Exception as e:
        config_utils.logger.error("Exception occured during prediction: {}".format(e))


def draw_bounding_boxes(original_image, inference_results):
    r"""
    Overlays inferred bounding boxes on original image and writes a copy to disk

    :param original_image: numpy array of the original image
    :param inference_results: JSON object containing inference results
    """

    output_image = original_image
    height, width, channels = output_image.shape

    config_utils.logger.info(inference_results)

    for result in inference_results:
        boundaries = np.fromstring(result["Boundaries"][1:-1], dtype=float, sep=" ")
        box_label = "{} : {}".format(result["Label"], result["Score"])
        y_min = floor(boundaries[0] * height)
        x_min = floor(boundaries[1] * width)
        y_max = floor(boundaries[2] * height)
        x_max = floor(boundaries[3] * width)

        # Draw bounding box
        cv2.rectangle(
            img=output_image,
            pt1=(x_min, y_min),
            pt2=(x_max, y_max),
            color=(0, 0, 0),
            thickness=2,
        )

        # Draw black text outline
        cv2.putText(
            img=output_image,
            text=box_label,
            org=(
                x_min,
                int(y_min - (0.02 * height)),
            ),  # Draw text above top left of box
            fontFace=cv2.FONT_HERSHEY_SIMPLEX,
            fontScale=0.6,
            color=(255, 255, 255),
            thickness=3,
        )
        # Draw white text
        cv2.putText(
            img=output_image,
            text=box_label,
            org=(
                x_min,
                int(y_min - (0.02 * height)),
            ),  # Draw text above top left of box
            fontFace=cv2.FONT_HERSHEY_SIMPLEX,
            fontScale=0.6,
            color=(0, 0, 0),
            thickness=2,
        )

    output_path = os.path.join(
        config_utils.BOUNDED_OUTPUT_DIR, config_utils.DEFAULT_BOUNDED_OUTPUT_IMAGE_NAME
    )
    cv2.imwrite(output_path, output_image, [cv2.IMWRITE_JPEG_QUALITY, 100])
    config_utils.logger.info("Output image with bounding boxes to {}".format(output_path))
