'use strict';

/*
 *****************
 * Configuration *
 *****************
 */
// The AWS region in which to operate (eu-west-1, us-east-1, etc.).
var awsRegion = '';

// The ID of the Cognito Identity Pool that will be used to authenticate your
// requests to the AWS API.
var cognitoIdentityPoolId = '';
/*
 ************************
 * End of Configuration *
 ************************
 */

/*
 * HINT: instantiate here the Rekognition client. To authenticate your requests
 * to the AWS API, use the Cognito Identity Pool that you created earlier as
 * part of this lab.
 */
//@beginExercise
AWS.config.region = awsRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
});
let rekognitionClient = new AWS.Rekognition();
//@endExercise

var emotionTexts = {
    "CALM": "Tengo sueño, ¡necesito la energía de AWS!",
    "SAD": "Los servidores on-prem me entristecen...",
    "CONFUSED": "No entiendo esta demo, voy a preguntarle a un SA.",
    "HAPPY": "¡Me encanta la inteligencia artificial!",
    "ANGRY": "El hambre me tiene de mal humor...",
    "DISGUSTED": "¿Algún médico en la sala?",
    "SURPRISED": "¡Hala! ¡Cómo mola esta demo!"
};

function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Uint8Array(array);
}

function renderLabels(labels) {
    let labelTemplate = `<div class="label">
          <span class="labelName"></span>
          <div class="confidencePctBar">
            <div class="confidencePctBarValue"></div>
          </div>
        </div>`;
    let labelContainer = $('#labels');
    labelContainer.empty();

    labels.slice(0, 10).forEach(label => {
        if (label.Confidence > 50) {
            let labelElement = $(labelTemplate);
            labelElement.find('.labelName').text(label.Name.toUpperCase());
            labelElement.find('.confidencePctBarValue').css('width', Math.floor(label.Confidence) + '%');
            labelContainer.append(labelElement);
        }
    });
}

function renderFaces(faces, camWidth, camHeight) {
    let faceboxTemplate = `<div class="facebox">
        <div class="emotion">
          <span class="emotionName"></span>
          <div class="confidencePctBar">
            <div class="confidencePctBarValue"></div>
          </div>
        </div>
      </div>`;

    let faceboxes = $('#faceboxes');
    faceboxes.empty();

    $("#faceResults").empty();
    $("#faceBox").empty();

    let frameOffset = $('#videoFrame').offset();
    let frameOffsetLeft = frameOffset.left;
    let frameOffsetTop = frameOffset.top;

    if (faces.length > 0) {
        faces.forEach(face => {
            let mainEmotion = null;

            for (var i in face.Emotions) {
                let emotion = face.Emotions[i];
                if (mainEmotion === null || (mainEmotion !== null && emotion.Confidence > mainEmotion.Confidence)) {
                    mainEmotion = emotion;
                }
            }

            let facebox = $(faceboxTemplate);
            facebox.css('top', (frameOffsetTop + face.BoundingBox.Top * camHeight) + "px");
            facebox.css('left', (frameOffsetLeft + face.BoundingBox.Left * camWidth) + "px");
            // Extend height to account for label and confidence bar
            facebox.css('height', (face.BoundingBox.Height * camHeight) + 30 + "px");
            facebox.css('width', (face.BoundingBox.Width * camWidth) + "px");

            if (mainEmotion != null && mainEmotion.Confidence > 30 && mainEmotion.Type in emotionTexts) {
                facebox.find('.emotionName').text(mainEmotion.Type);
                facebox.find('.confidencePctBarValue').css('width', Math.floor(mainEmotion.Confidence) + '%');
            }

            faceboxes.append(facebox);
        });
    }
}

function renderCelebrities(celebrities, camWidth, camHeight) {
    let celebrityTemplate = `<div>
            <span>Celebrity similarity:</span>
            <span class="celebrityName"></span>
            <div class="confidencePctBar">
                <div class="confidencePctBarValue"></div>
            </div>
        </div>`;

    let celebrityMatch = $('#celebrityMatch');
    celebrityMatch.empty();

    let celebrityElement = $(celebrityTemplate);
    console.log(celebrityElement.find('.celebrityName'));

    if (celebrities.length > 0) {
        celebrityElement.find('.celebrityName').text(celebrities[0].Name.toUpperCase());
        celebrityElement.find('.confidencePctBarValue').css('width', Math.floor(celebrities[0].MatchConfidence) + '%');
    } else {
        celebrityElement.find('.celebrityName').text('-- NO MATCH --');
        celebrityElement.find('.confidencePctBarValue').css('width', '0');
    }

    celebrityMatch.append(celebrityElement);
}

function processFrame(camWidth, camHeight) {
    Webcam.snap(function(data_uri) {
        let imageBlob = dataURItoBlob(data_uri);

        let labelsPromise = new Promise((resolve, reject) => {
            //@beginExercise
            let detectLabelsParams = {
                Image: {
                    Bytes: imageBlob
                }
            };
            rekognitionClient.detectLabels(detectLabelsParams, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    renderLabels(data.Labels);
                    resolve(data);
                }
            });
            //@endExercise
        });

        let facesPromise = new Promise((resolve, reject) => {
            //@beginExercise
            let detectFacesParams = {
                Attributes: ["ALL"],
                Image: {
                    Bytes: imageBlob
                }
            };
            rekognitionClient.detectFaces(detectFacesParams, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    renderFaces(data.FaceDetails, camWidth, camHeight);
                    resolve(data);
                }
            });
            //@endExercise
        });

        let celebritiesPromise = new Promise((resolve, reject) => {
            //@beginExercise
            let recognizeCelebritiesParams = {
                Image: {
                    Bytes: imageBlob
                }
            };
            rekognitionClient.recognizeCelebrities(recognizeCelebritiesParams, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    renderCelebrities(data.CelebrityFaces, camWidth, camHeight);
                    resolve(data);
                }
            });
            //@endExercise
        });
    });
}

window.onload = () => {
    let viewWidth = 720;
    let viewHeight = 480;

    Webcam.set({
        width: viewWidth,
        height: viewHeight,
        dest_width: viewWidth,
        dest_height: viewHeight,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach('#videoFrame');

    Webcam.on('live', function() {
        // get cam view size
        let videoFrame = document.getElementById("videoFrame");
        let cam = $(videoFrame).find("video")[0];
        let camWidth = cam.videoWidth;
        let camHeight = cam.videoHeight;

        setInterval(processFrame.bind(null, camWidth, camHeight), 3000);
    });
}
