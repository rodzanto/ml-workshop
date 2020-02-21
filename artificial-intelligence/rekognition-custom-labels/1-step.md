# Rekognition Custom Labels

In this lab you will explore [Amazon Rekognition Custom Labels](https://aws.amazon.com/rekognition/custom-labels-features/), a feature that allows you identifying objects and scenes in images that are specific to your business needs. With Custom Labels you simply need to supply images of objects or scenes you want to identify, and the service handles the rest for you.

You can check the AWS Machine Learning Blog post [here](https://aws.amazon.com/blogs/machine-learning/announcing-amazon-rekognition-custom-labels/).

**Entry level:**

You can start by setting up a simple demo application following this lab, where you will:
* Setup and deploy a Cloud Formation template for the demo.
* Play around with the demo GUI.

![architecture diagram](https://github.com/aws-samples/amazon-rekognition-custom-labels-demo/raw/master/docs/amazon-rekognition-1.png)

[![go to lab](../../_media/go-to-lab.png)](https://github.com/aws-samples/amazon-rekognition-custom-labels-demo)

<br>

**Advanced Level:**

If you want to dig deeper into Rekognition Custom Labels (and other Computer Vision alternatives with SageMaker) you can continue with this advanced workshop, where you can:
1. Create a SageMaker notebook instance (instructions [here](https://docs.aws.amazon.com/sagemaker/latest/dg/gs-setup-working-env.html))
2. [Add](https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-notebooks-now-support-git-integration-for-increased-persistence-collaboration-and-reproducibility/) the following Git repository to your SageMaker notebook: ***https://github.com/everdark/computer-vision-workshops***
3. Once your notebook instance is running, open the Jupyter environment
4. Follow the labs you wish:
    - **Rekognition Custom Labels**: Open the "gt_object_det" folder and follow the instructions on each notebook
    - **MXNet image classification**: Open the "mxnet_gluon_mnist" folder and follow the instructions on the "mxnet_mnist_with_gluon" notebook
    - **TensorFlow image classification (script mode)**: Open the "tf_script_mode" folder and follow the instructions on the "tensorflow_script_mode_training_and_serving" notebook
