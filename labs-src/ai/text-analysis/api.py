import boto3
import json
import urllib3

#
# HINT: instantiate the Boto3 clients for each service.
#
#@beginExercise
textract = boto3.client('textract')
comprehend = boto3.client('comprehend')
#@endExercise

http = urllib3.PoolManager()


def detect_text_in_image(bucket_name, key):
    #
    # HINT: call Textract's DetectDocumentText action and return a string with
    # all lines joined together.
    #
    #@beginExercise
    response = textract.detect_document_text(
        Document={
            'S3Object': {
                'Bucket': bucket_name,
                'Name': key
            }
        }
    )
    blocks = filter(lambda x: x['BlockType'] == 'LINE', response['Blocks'])
    lines = map(lambda x: x['Text'], blocks)
    return "\n".join(lines)
    #@endExercise

def analyze_text(text):
    #
    # HINT: call Comprehend's DetectSentiment and DetectEntities actions. But
    # first, you will need to get the dominant language of the text. There is
    # another Comprehend action called DetectDominantLanguage for that.
    #
    # Return a dict with the following structure:
    #
    #   {
    #       'Language': <the code of the dominant language>,
    #       'SentimentAnalysis': <containing both the sentiment and sentiment score>,
    #       'Entities': <all entities except those of type DATE and QUANTITY>
    #   }
    #@beginExercise
    response = comprehend.detect_dominant_language(
        Text=text
    )
    language = response['Languages'][0]['LanguageCode']

    response = comprehend.detect_sentiment(
        Text=text,
        LanguageCode=language
    )
    sentiment = {'Sentiment': response['Sentiment'], 'SentimentScore': response['SentimentScore']}

    response = comprehend.detect_entities(
        Text=text,
        LanguageCode=language
    )
    entities = filter(lambda x: x['Type'] not in ['DATE', 'QUANTITY'], response['Entities'])

    return {'Language': language, 'SentimentAnalysis': sentiment, 'Entities': list(entities)}
    #@endExercise

def search_wikipedia(term):
    r = http.request('GET', 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch={}'.format(term))
    return json.loads(r.data)['query']['search'][0]

def build_response(status, body=None):
    return {
        'statusCode': status,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
            'X-Requested-With': '*'
        },
        'body': json.dumps(body) if body else None
    }

def build_not_found():
    return build_response(404, {'error': 'Not found'})

def build_method_not_allowed():
    return build_response(405, {'error': 'Method not allowed'})

def lambda_handler(event, context):
    method = event['requestContext']['http']['method']
    path = event['requestContext']['http']['path']
    body = json.loads(event['body']) if 'body' in event else None
    qs = event['queryStringParameters'] if 'queryStringParameters' in event else {}

    if method == 'OPTIONS':
        return build_response(200)

    if path == '/text_detection':
        if method == 'POST':
            response = detect_text_in_image(body['bucket_name'], body['key'])
            return build_response(200, {'Text': response})
        else:
            return build_method_not_allowed()

    elif path == '/text_analysis':
        if method == 'POST':
            response = analyze_text(body['text'])
            return build_response(200, response)
        else:
            return build_method_not_allowed()

    elif path == '/wikipedia_search':
        if method == 'GET':
            if 'term' not in qs:
                return build_bad_request()
            response = search_wikipedia(qs['term'])
            return build_response(200, response)
        else:
            return build_method_not_allowed()

    return build_not_found()
