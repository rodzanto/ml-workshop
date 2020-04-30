# Amazon SageMaker Autopilot SDK laboratory

In this lab, you will get to know **Amazon SageMaker Autopilot** by using the SDK through the following steps:
1. Creating a new **Amazon SageMaker Studio** profile
    >*Note: If you already have an Studio profile in your account skip to step 2 below.*
    * Onboard to Amazon SageMaker Studio with the QuickStart
    * Open Studio
2. Working with an **Amazon SageMaker Autopilot** notebook in Studio
    * Exploring the notebook
    * Creating an **Amazon SageMaker Experiment** for organizing our candidates
    * Launching an **Amazon SageMaker Autopilot** job
    * Checking the results of the job
    * Performing an **Amazon SageMaker Batch Inference** with our best model

<br>
<div align="center">
    <img src="./arch.png" width="500" alt="Architecture"/>
</div>

-----------------

## **Creating a new Amazon SageMaker Studio profile**

First, onboard to SageMaker Studio using the Quick start:
* Open the AWS Console for your account.
* Look for Amazon SageMaker and click on it.
* Choose *Amazon SageMaker Studio* at the top left of the page.
* On the Amazon SageMaker Studio Control Panel, under Get started, choose Quick start.
    * For "User name", keep the default name or create a new name. The name can be up to 63 characters. Valid characters: A-Z, a-z, 0-9, and - (hyphen).
    * For Execution role, choose "Create a new role", the Create an IAM role dialog opens:
        * For S3 buckets you specify, specify additional S3 buckets that users of your notebooks can access. If you don't want to add access to more buckets, choose None.
    * Choose Create role. Amazon SageMaker creates a new IAM role with the AmazonSageMakerFullAccess policy attached.
    * Choose Submit.
* On the Amazon SageMaker Studio Control Panel, under Studio Summary, wait for "Status" to change to "Ready".
* When Status is Ready, the user name that you specified is enabled and chosen. The Add user and Delete user buttons, and the Open Studio link are also enabled.
* Choose "Open Studio". The Amazon SageMaker Studio loading page displays. When Studio opens you can start using it (this can take a few mins the first time).

Now that you've onboarded to Amazon SageMaker Studio, you can simply use the following steps to access Studio the following times.
* Open the Amazon SageMaker console.
* Choose "Amazon SageMaker Studio" at the top left of the page.
* On the Amazon SageMaker Studio Control Panel, choose your user name and then choose "Open Studio".

## **Working with an Amazon SageMaker Autopilot notebook in Studio**

