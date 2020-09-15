![Banner](images/banner.png)
### Why am I here?
Welcome to the Amazon Polly Builder Demo. As you may or may not know, you can use Amazon Polly to generate speech from either plain text or from documents marked up with Speech Synthesis Markup Language (SSML). The objective of this demo is for you to try out the different SSML tags available in a user friendly way and easily enable you to create enriched speech fragments.

### Why do I need?

* **Web Browser** I imagine you already have one if you are reading this.  
* **AWS Account** If you don't already have an account or you have not been handed one as part of a workshop, please visit the following [link](https://aws.amazon.com/es/free)! 
* **Text editor** Don't worry if you are not a Coding Guru, I promise setting the demo up will be very easy!


### What am I going to build?

As mentioned before, the objective is for you to test the different SSML tags you can use with Amazon Polly, so for this reason you are going to deploy all the infrastructure needed automatically with an AWS CloudFormation template already created. 

Let's have a look at the two infrastructures you are going to be able to deploy. 

#### 1. I want to run the webapp locally on my computer!

If you choose to deploy this semi-automated infrastructure, Amazon API Gateway and AWS Lambda (with the appropriate role to call Amazon Polly) will be deployed and configured. You will also have to open the static assets locally on your computer and make a small change in the code which I will specify you later.

![Semi-Automated](images/semi-automated.png)

* **Step 1:** Deploy the AWS Infrastructure:
  * [Launch](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?templateURL=https://amazon-polly-demo.s3-eu-west-1.amazonaws.com/amazon-polly-builder-local.yaml&stackName=Amazon-Polly-Builder) the following **AWS CloudFormation Template** in your account (The link will automatically open the AWS CloudFormation console).
  >__Note:__ If you are already running this CloudFormation Stack with the predefined Stack Name, please change the name of the new stack.
  * All parameters are already configured so just select your Stack Name, check the AWS CloudFormation acknowledgements and click Create stack.
  * Wait until the stack goes into the **CREATE_COMPLETE** status, then go to the **Outputs tab**.
  * You will see an output named **ApiEndpoint**. Take note of the url, as you will use it later. 

* **Step 2:** Download the necessary static files to run the webapp and configure the API call.
    * [Download](https://amazon-polly-demo.s3-eu-west-1.amazonaws.com/Amazon-Polly-Builder-Demo-Assets.zip) the following .zip file and decompress it!
    * Open the **api-gateway-endpoint.js** located in the **js** folder and insert the API url from the previous step in the first line, where you will see the follwing code:
    
      ``const apiEndpoint='REPLACE-THIS-WITH-THE-API-ENDPOINT';`` 
    
* **Step 3:** You are now ready to run index.html on your local server and start testing some of the different SSML tags available in Amazon Polly.
  * How do I create a local server? -> Navigate to the assets folder with ``cd PathToYourAssetsFolder``and run the following command ``python -m SimpleHTTPServer``. Next, just head to your browser and type in ``localhost:8000``and you should see the Amazon Polly Builder.

#### 2. I want Amazon Cloudfront and S3 to deliver the webapp!

If you choose to deploy the fully-automated infrastructure, in addition to the services mentioned in the previous point, an Amazon Cloudfront Distribution will also be deployed to securely access the statics assets that will be stored in an Amazon S3 bucket. 

![Fully-Automated](images/fully-automated.png)

* **Step 1:** Deploy the AWS Infrastructure:
  * [Launch](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?templateURL=https://amazon-polly-demo.s3-eu-west-1.amazonaws.com/amazon-polly-builder-full.yaml&stackName=Amazon-Polly-Builder) the following **AWS CloudFormation Template** in your account (The link will automatically open the AWS CloudFormation console).
  * All parameters are already configured so just check select your Stack Name, insert a **UNIQUE** S3 bucket name, check the AWS CloudFormation acknowledgements and click Create stack.
  * Wait until the stack goes into the **CREATE_COMPLETE status**, then go to the **Outputs tab**.
  * You will see an output named **CloudFront Endpoint** which you will use to access the demo.

* **Step 2:** You are now ready to open the Amazon CloudFront Endpoint and start testing some of the different SSML tags available in Amazon Polly.

### What should I be seeing?

If you followed correctly the previous steps you should be able to see the Amazon Polly Builder.

![Amazon-Polly-Builder](images/main.png)

### This looks really cool, but what is going on underneath?

Here is a brief explanation of the underlying services:

**Amazon Cloudfront + Amazon S3** 

If you don't want to run the webapp on your laptop you can serve the webapp from Amazon Cloudfront and Amazon S3. 

Amazon S3 is object storage built to store and retrieve any amount of data from anywhere on the Internet. It’s a simple storage service that offers an extremely durable, highly available, and infinitely scalable data storage infrastructure at very low costs.

Amazon CloudFront is a web service that gives businesses and web application developers an easy and cost effective way to distribute content with low latency and high data transfer speeds. You can set up a CloudFront distribution to serve your content while keeping your Amazon S3 bucket private and secure. 


**Amazon API Gateway**

Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale. The deployed API will act as a bridge between your frontend and backend, receiving the appropriate request an triggering the correspondent Lambda function which will receive the parameters take care of calling Amazon Polly.  

**AWS Lambda**

With Lambda, you can run code for virtually any type of application or backend service - all with zero administration. Just upload your code and the service takes care of everything required to run and scale your code with high availability. 

The Lambda function deployed will be triggered by API Gateway when a request is made from the webapp. The function is written in python and is quite simple: 
 1. Retrieve all the information from the event.
 2. Build the Amazon Polly pre-signed URL call.
 3. Call Amazon Polly and retrieve the pre-signed URL.
 4. Return the url with the generated speech back to the client.

**Amazon Polly**

Here is the most important service of the demo, and guess what, you don't need to set anything up to use it! This service is part of our AWS AI	Services which are purely API driven, so developers with no ML experience can leverage services already trained by AWS.

As you can see in the following example, you can call Amazon Polly via API with the necessary fields and it will return you the generated audio.   


