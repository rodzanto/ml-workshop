# End to End Workflow for Fraud Detection with Amazon SageMaker

In this lab, we will address business problems regarding auto insurance fraud, technical solutions, explore dataset, solution architecture, and scope the machine learning (ML) life cycle.

During the lab we will explore the following functionalities:
* Amazon SageMaker Studio
* Amazon SageMaker Data Wrangler
* Amazon SageMaker Feature Store
* Amazon SageMaker Training Jobs
* Amazon SageMaker Clarify
* Amazon SageMaker Model Registry
* Amazon SageMaker Endpoints
* Amazon Pipelines

-----------------

## **Opening Amazon SageMaker Studio**

For this lab we will use the integrated IDE for ML, called **Amazon SageMaker Studio**, with the following steps:
* Open the AWS Console for your account.
* Look for Amazon SageMaker and [click on it](https://eu-west-1.console.aws.amazon.com/sagemaker/home?region=eu-west-1#/landing).
* Choose *Amazon SageMaker Studio* at the top left of the page.

![Amazon Sagemaker Studio](screen2.png)

* Look for "Open Studio" in the right side of the screen and click on it. The Amazon SageMaker Studio loading page displays. When Studio opens you can start using it. 

**Note: this can take a few mins the first time you open it**

![Open Studio](screen1.png)

## **Cloning the example repository and running the notebooks for the end-to-end lab**

Now that your SageMaker Studio is open, you will get the notebook that we will be using and follow the steps on it:
* If not open already, create a new Studio Launcher tab by going to "File"->"New Launcher".

![screen3](screen3.png)

* Click on **"System Terminal"** to open a new terminal tab.
* Copy-paste the following command in the terminal and hit enter. This will clone the [Amazon SageMaker Examples GitHub repository](https://github.com/aws/amazon-sagemaker-examples/) to your Studio local environment.
    ```
    git clone https://github.com/aws/amazon-sagemaker-examples/
    ```

* In the left menu go to the **"File Browser"** (folder icon at the top-left).
* Double click the new folder ***"amazon-sagemaker-examples"***
* Double click the folder ***"end_to_end"***
* Double click the first notebook file called ***"0-AutoClaimFraudDetection.ipynb"***. The notebook will open on a new tab.
* In the select kernel pop-up, select "Python (Data Science)".
* Now **read** and follow the cells in the notebook one by one.
    > If you are new to Jupyter notebooks, you can run the notebook document step-by-step (one cell a time) by pressing "shift" + "enter". Note:
    > * While a cell is running it will show an asterix "*" next to it
    > * When the cell execution completes it will show the execution number

The notebook will guide you through the process. When indicated proceed to the next notebook.

You can also check a blog post explaining this lab in more detail:

https://aws.amazon.com/blogs/machine-learning/architect-and-build-the-full-machine-learning-lifecycle-with-amazon-sagemaker/

Thank you!