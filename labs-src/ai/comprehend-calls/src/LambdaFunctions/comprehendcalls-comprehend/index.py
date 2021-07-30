import json
import boto3
import urllib3

s3 = boto3.resource('s3')
comprehend = boto3.client('comprehend')


def lambda_handler(event, context):
    # Retrieve transcribe results uri sent to Comprehend Text Lambda

    uri = event['transcribeUri']
    print(uri)

    # Get bucket and key names

    bucket = uri.split('"')[1].split("/")[3]
    key = uri.split('"')[1].split("/")[4] + '/' + uri.split('"')[1].split("/")[5]

    print("Bucket: " + bucket + " , Key = " + key)

    # Get object
    obj = s3.Object(bucket, key)
    body = obj.get()['Body'].read()

    # Encode object
    encoding = 'utf-8'
    transcript = json.loads(body.decode(encoding))
    transcriptionId = key.split("/")[1].split(".json")[0]

    # Get Transcript Language
    language_response = comprehend.detect_dominant_language(
        Text=transcript['results']['transcripts'][0]['transcript']
    )
    transcript_language = language_response["Languages"][0]["LanguageCode"]

    # Helper Functions

    def extract_text(items):
        text = ""
        for item in list(items):
            text += item['alternatives'][0]['content'] + " "
        return text

    def get_text_from_segment(start_time, end_time):
        items_list = filter(lambda item: (
                    float(item['start_time']) >= float(start_time) and float(item['start_time']) < float(end_time)),
                            filter(lambda item: (item['type'] == 'pronunciation'), transcript['results']['items']))
        text = extract_text(items_list)
        return text

    def extract_sentiment(text, language):
        sentiment_response = comprehend.detect_sentiment(
            Text=text,
            LanguageCode=language
        )
        return sentiment_response["Sentiment"]

    def extract_entities(text, language):
        entities_response = comprehend.batch_detect_entities(
            TextList=[text],
            LanguageCode=language
        )
        entities = entities_response["ResultList"][0]["Entities"]
        return entities

    def extract_entities_ddb(text, language):
        entity_list = {}
        entities_response = comprehend.batch_detect_entities(
            TextList=[text],
            LanguageCode=language
        )
        for entity in entities_response["ResultList"][0]["Entities"]:
            entity_list[entity["Text"]] = {"S": entity["Type"]}

        return {"M": entity_list}

    # Define response
    comprehendResults_s3 = []
    comprehendResults_s3_conversation = []
    comprehendResults_s3_entity_list = []
    comprehendResults_ddb = {}
    comprehendResults_ddb["TranscriptionId"] = {"S": transcriptionId}
    segments_list = []

    # Iterate Segments
    segment_id = 0
    for segment in transcript['results']['speaker_labels']['segments']:

        segment_text = get_text_from_segment(segment['start_time'], segment['end_time'])

        temp_dynamo = {
            "M": {
                "Transcript": {"S": transcriptionId},
                "Segment_id": {"S": transcriptionId + "_" + str(segment_id)},
                "Start": {"S": segment['start_time']},
                "End": {"S": segment['end_time']},
                "Speaker": {"S": segment['speaker_label']},
                "Segment_text": {"S": segment_text},
                "Sentiment": {"S": extract_sentiment(segment_text, transcript_language)},
                "Entities": extract_entities_ddb(segment_text, transcript_language)
            }

        }

        temp = {
            "Transcript": transcriptionId,
            "Segment_id": transcriptionId + "_" + str(segment_id),
            "Start": segment['start_time'],
            "End": segment['end_time'],
            "Speaker": segment['speaker_label'],
            "Segment_text": segment_text,
            "Sentiment": extract_sentiment(segment_text, transcript_language)
        }

        segments_list.append(temp_dynamo)
        comprehendResults_s3_conversation.append(temp)

        for entity in extract_entities(segment_text, transcript_language):
            temp_ent = {
                "Type": entity['Type'],
                "Text": entity['Text'],
                "Segment_id": transcriptionId + "_" + str(segment_id)
            }
            comprehendResults_s3_entity_list.append(temp_ent)

        segment_id = segment_id + 1
    comprehendResults_ddb["Segments"] = {"L": segments_list}
    comprehendResults_s3.append(comprehendResults_s3_conversation)
    comprehendResults_s3.append(comprehendResults_s3_entity_list)

    # Print results
    print(comprehendResults_s3)
    print(comprehendResults_ddb)
    print(json.dumps(comprehendResults_ddb))
    # Return results

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!'),
        'comprehendResults_ddb': json.dumps(comprehendResults_ddb),
        'comprehendResults_s3': comprehendResults_s3,
        'transcriptionid': transcriptionId
    }
