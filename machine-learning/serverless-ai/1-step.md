# Serverless AI workshop

This workshop demonstrates two methods of machine learning inference for globally-scalable production using [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon SageMaker](https://aws.amazon.com/sagemaker/).

[Scikit-learn](https://scikit-learn.org/) is a popular Python machine learning library that covers most aspects of shallow learning. With these techniques the library module and your custom inference code can be combined into a flexible package for immediate cloud deployment.

The workshop is comprised by two different labs:

1. **Lambda and SciKit Learn Inference:** develop a simple sentiment analysis model using scikit learn's build-in linear regression algorithm
2. **SageMaker Batch Transform:** use the MNIST dataset to create a predictive model using SageMaker's K-Means built-in algorithm. After the model is trained, Sagemaker's batch transform job will be created and called from a Lambda function for inference.

[![go to lab](../../_media/go-to-lab.png)](https://github.com/aws-samples/serverless-ai-workshop)
