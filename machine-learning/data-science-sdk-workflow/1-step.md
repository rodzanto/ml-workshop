# Workflow with Data Science SDK

Imagine you own an ecommerce store, and you want to create an ML pipeline that prepares the daily sales’ transactions data for training a regression model, for example to predict the sales price of some items.

This Amazon Sagemaker notebook will show you how to build an end-to-end ML/AI workflow using [AWS Step Functions](https://aws.amazon.com/step-functions/) and its [Data Science SDK](https://docs.aws.amazon.com/en_us/step-functions/latest/dg/concepts-python-sdk.html).

It uses the [Online Retail dataset from the UCI](https://archive.ics.uci.edu/ml/datasets/Online+Retail), containing gift products’ selling transactions, including its price.

At the end of the notebook you will be able to export the AWS CloudFormation template for the pipeline you have just built, in order to deploy it later on as infrastructure as code if required.

[![go to lab](../../_media/go-to-lab.png)](https://github.com/rodzanto/sm-ws/blob/master/08%20Build%20end-to-end%20workflows%20with%20Step%20Functions%20Data%20Science%20SDK/amazon-sagemaker-e2e-workflows-data-science-sdk.ipynb)
