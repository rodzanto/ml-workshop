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
    "CONFUSED": "No entiendo esta demo, voy a preguntarle a un SA",
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
    $("#labelResults").empty();
    let labelTemplate = "<div><span class='rekLabel'></span> - <span class='rekScore'></span> %</div>";
    $.each(labels, function(index, value) {
        if (value.Confidence > 50) {
            let LabelToAdd = $(labelTemplate);
            $(LabelToAdd).find(".rekLabel").text(value.Name.toLowerCase());
            $(LabelToAdd).find(".rekScore").text(Math.floor(value.Confidence));
            $("#labelResults").append(LabelToAdd);
        }
    });
}

function renderFaces(faces) {
    $("#faceResults").empty();
    $("#faceBox").empty();
    if (faces.length > 0) {
        labelTemplate = "<div><span class='rekType'></span> - <span class='rekScore'></span> %</div>";
        $.each(faces[0].Emotions, function(index, value) {
            if (value.Confidence > 30) {
                let LabelToAdd = $(labelTemplate); $(LabelToAdd).find(".rekType").text(value.Type.toLowerCase()); $(LabelToAdd).find(".rekScore").text(Math.floor(value.Confidence)); $("#faceResults").append(LabelToAdd);
                if (mainEmotion == null || (mainEmotion != null && value.Confidence > mainEmotion.Confidence)) {
                    mainEmotion = value;
                }
            }
        });

        // bounding box
        let box = document.getElementById("box")
        box.style.left = (faces[0].BoundingBox.Left * camWidth) + "px";
        box.style.width = (faces[0].BoundingBox.Width * camWidth) + "px";
        box.style.top = (faces[0].BoundingBox.Top * camHeight) + "px";
        box.style.height = (faces[0].BoundingBox.Height * camHeight) + "px";

        // speech bubbles
        let speechBubble = document.getElementById("speechBubble");
        speechBubble.style.left = ((faces[0].BoundingBox.Left * camWidth) + (faces[0].BoundingBox.Width * camWidth)) + "px";
        speechBubble.style.top = ((faces[0].BoundingBox.Top * camHeight) - 100) + "px";
        let faceResults = document.getElementById("faceResults");
        faceResults.style.top = (faces[0].BoundingBox.Top * camHeight - 50) + "px";
        faceResults.style.left = (faces[0].BoundingBox.Left * camWidth - 20) + "px";
        let faceBox = document.getElementById("faceBox");
        faceBox.style.top = (faces[0].BoundingBox.Top * camHeight) + "px";
        faceBox.style.left = (faces[0].BoundingBox.Left * camWidth) + "px";
        faceBox.style.height = (faces[0].BoundingBox.Height * camHeight) + "px";
        faceBox.style.width = (faces[0].BoundingBox.Width * camWidth) + "px";
        if (mainEmotion != null && mainEmotion.Confidence > 30 && mainEmotion.Type in emotionTexts) {
            speechBubble.innerText = emotionTexts[mainEmotion.Type];
            speechBubble.style.visibility = "visible";
            faceResults.style.visibility = "visible";
            faceBox.style.visibility = "visible";
        }
    } else {
        // no faces onscreen
        document.getElementById("speechBubble").style.visibility = "hidden";
        document.getElementById("faceResults").style.visibility = "hidden";
        document.getElementById("faceBox").style.visibility = "hidden";
    }
}

function renderCelebrities(celebrities) {
    $("#faceCelebrity").empty();
    if (celebrities.length > 0) {
        let faceCelebrity = document.getElementById("faceCelebrity");
        faceCelebrity.style.top = (celebrities[0].Face.BoundingBox.Top * camHeight) + "px";
        faceCelebrity.style.left = (celebrities[0].Face.BoundingBox.Left * camWidth) + "px";
        faceCelebrity.style.height = (celebrities[0].Face.BoundingBox.Height * camHeight) + "px";
        faceCelebrity.style.width = (celebrities[0].Face.BoundingBox.Width * camWidth) + "px";
        faceCelebrity.innerHTML = celebrities[0].Name + ' - ' + data.CelebrityFaces[0].MatchConfidence + '%';
        faceCelebrity.style.visibility = "visible";
    } else {
        document.getElementById("faceCelebrity").style.visibility = "hidden";
    }
}

function processFrame(camWidth, camHeight) {
    let mainEmotion = null

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

        //@beginExercise
        let facesPromise = new Promise((resolve, reject) => {
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
                    renderFaces(data.FaceDetails);
                    resolve(data);
                }
            });
        });
         //@endExercise

        //@beginExercise
        let celebritiesPromise = new Promise((resolve, reject) => {
            let recognizeCelebritiesParams = {
                Image: {
                    Bytes: imageBlob
                }
            };
            rekognitionClient.recognizeCelebrities(recognizeCelebritiesParams, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    renderCelebrities(data.CelebrityFaces);
                    resolve(data);
                }
            });
        });
        //@endExercise

        // Promise.all([labelsPromise, facesPromise, celebritiesPromise])
        //     .catch(() => {
        //         console.error('oops');
        //     })
        //     .then(() => {
        //         console.log('done');
        //         processFrame(camWidth, camHeight);
        //     });
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

        setInterval(processFrame.bind(null, camWidth, camHeight), 4000);
    });
}
