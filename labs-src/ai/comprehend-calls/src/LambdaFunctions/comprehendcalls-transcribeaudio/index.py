import json
import boto3
import time
import os

client = boto3.client('transcribe')


def lambda_handler(event, context):

    '''
    Retrieve bucket and key sent to Transcribe Audio Lambda
    '''

    bucket = event['bucket_name']
    key = event['file_key']
    timems = str(int(round(time.time() * 1000)))


    start_transcription_response = client.start_transcription_job(
            TranscriptionJobName='T-'+timems+'-'+key.split("/")[1],
            IdentifyLanguage = True,
            MediaFormat=key.split(".")[1],
            Media={
                'MediaFileUri': "s3://"+bucket+"/"+key
            },
            OutputKey = 'transcripts/',
            OutputBucketName= os.environ["OutputBucket"],
            Settings={
                'ShowSpeakerLabels': True,
                'MaxSpeakerLabels': 2,
            }

        )

    print(start_transcription_response)

    while True:
        status = client.get_transcription_job(TranscriptionJobName='T-'+timems+'-'+key.split("/")[1])
        if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            print("Complete")
            break
        print("Not ready yet...")
        time.sleep(10)
    print(f"transcript URL is {status['TranscriptionJob']['Transcript']['TranscriptFileUri']}")

    return {
        'statusCode': 200,
        'body': json.dumps('The audio file has been transcribed!'),
        'transcribeUri': json.dumps(status['TranscriptionJob']['Transcript']['TranscriptFileUri'])
    }
