import json
import boto3
import os

s3 = boto3.resource('s3')
bucket = s3.Bucket(os.environ["OutputBucket"])


def lambda_handler(event, context):
    comprehendResults = event['comprehendResults_s3']

    comprehendResults_conversation = comprehendResults[0]
    comprehendResults_entities = comprehendResults[1]

    # print(json.dumps(comprehendResults_conversation, ensure_ascii=False))
    # print(json.dumps(comprehendResults_entities, ensure_ascii=False))

    response_s3_1 = bucket.put_object(
        Body=json.dumps(comprehendResults_conversation, ensure_ascii=False),
        Key="transcriptions-insights/conversations/" + event["transcriptionid"].split(".")[0] + "-conversation.json"
    )

    print(response_s3_1)

    response_s3_2 = bucket.put_object(
        Body=json.dumps(comprehendResults_entities, ensure_ascii=False),
        Key="transcriptions-insights/entities/" + event["transcriptionid"].split(".")[0] + "-entities.json"
    )

    print(response_s3_2)

    return {
        'statusCode': 200,
        'body': json.dumps('Insights loaded into S3!')
    }
