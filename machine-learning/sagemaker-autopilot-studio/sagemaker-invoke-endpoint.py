import json
import boto3

runtime = boto3.client('runtime.sagemaker')

def lambda_handler(event, context):
    
    print(event)
    payload = event['data']
    print(payload)
    
    response = runtime.invoke_endpoint(EndpointName='sm-autopilot-lab',
                                       ContentType='text/csv',
                                       Body=payload)
    print("Response: --------")

    pred = response['Body'].read().decode()
    print(pred)
    return pred
