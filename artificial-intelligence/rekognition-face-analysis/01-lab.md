# Scene and face analysis with Amazon Rekognition

In this lab, you will use several Amazon Rekognition features to analyze and detect objects and faces from a video frame. You will capture these frames from your webcam using a simple web application, and the returned information will be overlaid on top of the frame.

## Create a Cognito Identity Pool

[Amazon Cognito](https://aws.amazon.com/cognito/) is a fully-managed service that handles user sign-up, sign-in and access control. You might be wondering _"Hey, I came here to do AI-related stuff. What does Cognito have to do with that?"_, and that would be fair.

Remember that we'll be using a web application to capture frames and call the Rekognition API. As with all requests made to AWS services, these will need to be authenticated. However, we don't want to deal with harcoded API keys or secrets in our JavaScript code, so we will use a feature of Cognito called **Identity Pools** which will provide us with temporary, anonymous credentials that can use Rekognition and nothing else. The main advantage of using temporary credentials is that they are short-lived and are rotated frequently.

?> **Exercise:** create a Cognito Identity Pool. Enable unauthenticated access and associate the pool to an IAM role that grants access to Rekognition.

<details>
<summary>Stuck? Click here to view the solution.</summary>

1. Navigate to the [Cognito console](https://eu-west-1.console.aws.amazon.com/cognito/home?region=eu-west-1). Watch the region - the link takes you to **eu-west-1 (Ireland)** but you might be doing this workshop in a different one. You can switch regions using the selector in the top right corner.
2. Click on **Managed Identity Pools**. If this is the first pool you are creating, then you will be directly taken to the creation wizard. Otherwise you might need to click on **Create new identity pool**.
3. Give a name to your pool, such as `Rekognition web app`.
4. Check **Enable access to unauthenticated identities**. By checking this, Cognito will issue temporary credentials to users that have not been authenticated.
5. Click on **Create Pool**.
6. You will be taken to the IAM quick-create page, where the two default IAM roles will be automatically created (one for the authenticated flow and another one for the unauthenticated flow). The defaults are good for us, so just click on **Allow**.
7. Once you are back to Cognito, you will be shown a code snippet under _Get AWS Credentials_ which looks like the following:

    ```java
    // Initialize the Amazon Cognito credentials provider
    CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
        getApplicationContext(),
        "eu-west-1:aaaaaaaa-bbbb-cccc-dddd-dddddddddddd", // Identity pool ID
        Regions.EU_WEST_1 // Region
    );
    ```

    Take note of the Identity Pool ID (the string that begins with `eu-west-1:...`, or whatever region you are using). You will use it later.

Great! The pool has been created, but the credentials that it provides currently don't allow to do much. We need to modify the IAM role so that it can access Rekognition.

1. Go to the [IAM console](https://console.aws.amazon.com/iam/home) and click on **Roles** on the left menu.
2. Look for a role called `Cognito_RekognitionwebappUnauth_Role`. Click on the role.
3. Click on **Attach policies**.
4. Look for a policy called **AmazonRekognitionFullAccess**. This is an AWS-managed policy that grants full-access to the Rekognition API. Ideally, in production you would use a narrower policy to follow the [principle of least-privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).
5. Click on **Attach policy**.

Excellent! Now the Cognito Identity Pool will grant temporary credentials to all the users of our web application, even if they are not authenticated, and these credentials will allow them to call Rekognition.

</details>

## Download the web application

We have mentioned a "web application" a couple of times already. This is just a simple HTML/CSS/JS web app that is almost fully complete, but is missing some key functionality that you need to implement.

Begin by downloading the source code from [this link](https://aimlworkshopspipeline-workshopresourcesbucket-22rpkozo2usk.s3-eu-west-1.amazonaws.com/aiml-workshops-face-detection-www.zip). Uncompress it and open the **index.html** file in a web browser such as Chrome or Firefox. If everthing went right, the browser should ask you for permissions to use your computer's camera. Please, accept these permissions.

## Implement the calls to the Rekognition API

Even though the video is being shown on the screen, nothing happens. This is because the web application has not yet implemented the functionality that calls Rekognition to detect objects and faces. This is where you come in.

Open **script.js** with a text editor or IDE. Notice how at the top of the file, there are some empty variables declared:

```js
// The AWS region in which to operate (eu-west-1, us-east-1, etc.).
var awsRegion = '';

// The ID of the Cognito Identity Pool that will be used to authenticate your
// requests to the AWS API.
var cognitoIdentityPoolId = '';
```

Furthermore, if you scroll down through the code you will see a couple of comments that begin with `HINT`. These comments are telling you where the missing code needs to be implemented, and give you some tips about how to complete the task.

These are the tasks that need to be completed:

1. Fill in the variables at the top of the source code, in the section labeled `Configuration`. This includes the AWS region of your choice and the ID of the Cognito Identity Pool you created earlier.
2. Instantiate the Rekognition client using the AWS SDK for JavaScript, which has been already included in the web application. Use the Identity Pool as a credentials source for the SDK.
3. Fill in the blanks in the `processFrame()` function.

!> Note that all the logic that draws things on screen, such as bounding boxes that surround each face, has already been implemented for you. You only need to implement the actual calls to the Rekognition API using the AWS SDK. You can check [the official documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html) for reference.

?> **Exercise:** complete the steps listed above.

<details>
<summary>Stuck? Click here to view the solution.</summary>

The Rekognition client can be initialized as follows:

```js
AWS.config.region = awsRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
});
let rekognitionClient = new AWS.Rekognition();
```

The `processFrame()` function is called every time we grab a frame from the camera, which right now happens once every 3 seconds. This function should fire requests to the following Rekognition features:

* Detect objects in the scene.
* Detect faces and retrieve their characteristics.
* Find similarities with celebrities.

Your code should look like this right now (comments removed for brevity):

```js
let labelsPromise = new Promise((resolve, reject) => {
});

let facesPromise = new Promise((resolve, reject) => {
});

let celebritiesPromise = new Promise((resolve, reject) => {
});
```

Each of these promises declared above should make the actual requests using the Rekognition SDK, then render the data and finally be resolved with the data itself.

So, the scene detection request would be implemented as follows:

```js
let labelsPromise = new Promise((resolve, reject) => {
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
});
```

Likewise, here's the code for the face detection part:

```js
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
            renderFaces(data.FaceDetails, camWidth, camHeight);
            resolve(data);
        }
    });
});
```

And finally, the code for the celebrity recognition request:

```js
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
            renderCelebrities(data.CelebrityFaces, camWidth, camHeight);
            resolve(data);
        }
    });
});
```

</details>

If you reload the web application, after a few seconds some things should happen:

* On the right side of the camera viewport, a list of names should appear. These are the elements that Rekognition has detected on the scene. The bars under the names represent the confidence score. The higher the score, the more confidence Rekognition has of that assertion being true.
* Under the camera viewport, a celebrity name should be displayed if the face that appears on scene looks similar to any of the celebrities known to Rekognition. Again, the bar represents the confidence score.
* Lastly, an orange box will be overlaid over each face that Rekognition detects. The box will also indicate the main emotion displayed by the person, with the corresponding confidence score right below it.

That's it! You have successfully completed this lab. If you have some spare time and would like an additional challenge, why don't you tweak the code so that the web application shows the age of each person? (Hint: Rekognition's `DetectFaces` operation already returns this, we're just skipping that info!)
