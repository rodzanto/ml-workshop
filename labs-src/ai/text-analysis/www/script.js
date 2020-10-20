'use strict';

/*
 *****************
 * Configuration *
 *****************
 */
// The AWS API credentials needed to successfully call AWS services.
// You can create these from the IAM console.
var awsAccessKeyId = '';
var awsSecretAccessKey = '';

// The AWS region in which to operate (eu-west-1, us-east-1, etc.).
var awsRegion = '';

// The base endpoint of your API. Set this to the appropriate value.
// (Example: https://abcd1234e5..execute-api.eu-west-1.amazonaws.com)
var apiEndpoint = '';
/*
 ************************
 * End of Configuration *
 ************************
 */

/*
 * HINT: instantiate here the S3 client.
 */
//@beginExercise
var s3Client = new AWS.S3(
	{
		accessKeyId: awsAccessKeyId,
		secretAccessKey: awsSecretAccessKey,
		region: awsRegion
	}
);
//@endExercise

function showMessage(msg, cls) {
	var container = $('#alerts');
	var alert = $(
		`<div class="mt-4 mb-0 alert alert-${cls} alert-dismissible fade show" role="alert">`
  			+ msg
  			+ '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
    			+ '<span aria-hidden="true">&times;</span>'
  			+ '</button>'
		+ '</div>'
	);
	container.append(alert);
}

function showSuccess(msg) {
	return showMessage(msg, 'success');
}

function showWarning(msg) {
	return showMessage(msg, 'warning');
}

function showError(msg) {
	return showMessage(msg, 'danger');
}

function uploadFileToS3(file, bucket) {
	var promise = new Promise((resolve, reject) => {
		/*
		 * HINT: upload the provided file to the given bucket using the S3
		 * client you created before.
		 *
		 * Take a look at the .upload() method in the SDK documentation.
		 *
		 * Use the success/error callbacks to either resolve or reject the
		 * returned promise.
		 */
		//@beginExercise
		var params = {Bucket: bucket, Key: file.name, Body: file};
		s3Client.upload(params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
		//@endExercise
	});
	return promise;
}

function extractText(bucket, key) {
	var promise = new Promise((resolve, reject) => {
		$.ajax(
			`${apiEndpoint}/text_detection`,
			{
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({'bucket_name': bucket, 'key': key}),
				error: (jqXHR, status, errorThrown) => {reject(status)},
				success: (data, status) => {resolve(data)}
			}
		);
	});
	return promise;
}

function analyzeText(text) {
	var promise = new Promise((resolve, reject) => {
		$.ajax(
			`${apiEndpoint}/text_analysis`,
			{
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({'text': text.Text}),
				error: (jqXHR, status, errorThrown) => {reject(status)},
				success: (data, status) => {resolve(data)}
			}
		);
	});
	return promise;
}

function queryWikipedia(term) {
	var promise = new Promise((resolve, reject) => {
		$.ajax(
			`${apiEndpoint}/wikipedia_search?term=${term}`,
			{
				error: (jqXHR, status, errorThrown) => {reject(status)},
				success: (data, status) => {resolve(data)}
			}
		);
	});
	return promise;
}

function renderSentimentAnalysisResults(results) {
	$('#sentimentAnalysisSentiment').html(results.Sentiment);
	var score = results.SentimentScore[results.Sentiment.charAt(0).toUpperCase() + results.Sentiment.slice(1).toLowerCase()];
	score = Math.floor(score * 100);
	$('#sentimentAnalysisScore .progress-bar').css('width', `${score}%`);
	$('#sentimentAnalysisScore .progress-bar').html(`${score}%`);
	$('#sentimentAnalysisResults').css('display', 'block');
}

function renderWikipediaResults(results) {
	var resultsDiv = $('#wikiSearchResults');
	resultsDiv.html('');
	results.forEach(result => {
    var res = JSON.parse(result);
		var htmlTemplate =
			'<li class="media mb-3">'
				+ '<div class="media-body">'
					+ `<h5 class="mt-0 mb-1"><a href="https://en.wikipedia.org/wiki/${res.title}">${res.title}</a></h5>`
					+ res.snippet + '...'
				+ '</div>'
			+ '</li>'
		resultsDiv.append($(htmlTemplate));
	});
	resultsDiv.css('display', 'block');
}

function submitForm(event) {
	event.preventDefault();

	$('#wikiSearchResults').html('');
	$('#sentimentAnalysisResults').css('display', 'none');
	$('.firstUseAlert').css('display', 'none');
	$('.loading').css('display', 'block');

	var bucketName = $('#bucketName').val();
	var file = document.getElementById('image').files[0];

	uploadFileToS3(file, bucketName)
		.then(data => extractText(data.Bucket, data.Key))
    .then(data => JSON.parse(data))
		.then(data => analyzeText(data))
    .then(data => JSON.parse(data))
		.then(data => {
			renderSentimentAnalysisResults(data.SentimentAnalysis);

			var promises = [];
			data.Entities.forEach(entity => promises.push(queryWikipedia(entity.Text)));
			return Promise.all(promises);
		})

		.then(data => renderWikipediaResults(data))
		.then(() => {
			$('.loading').css('display', 'none');
			showSuccess('Nice! Your document was processed.');
		});
}

window.onload = () => {
	bsCustomFileInput.init();
	$('#form').submit(submitForm);
}
