function rowCreator(object){
    $('tbody').append(
        '<tr> <th scope="row">'+object.Lang+'</th> <td class="target"> English </td> ' +
        '<td class="original"><input class="form-control text-to-translate" data-id="'+object.Code+'" data-slang="'+object.Code+'" type="text"></td> ' +
        '<td class="translated"><span id="translated-'+object.Code+'"></span></td> ' +
        '<td class="sent-results"><span id="results-'+object.Code+'"></span></td> ' +
        '<td><span id="ent-results-'+object.Code+'" class="ent-results"></span></td> ' +
        '<td><span id="pii-results-'+object.Code+'" class="pii-results"></span></td> ' +
        '</tr>');
}
function colorFiller(sentiment){
        var color;
        switch (sentiment) {
          case "NEUTRAL":
              color = "grey"
              break;
          case "NEGATIVE":
              color = "orangered"
              break;
          case "MIXED":
              color = "darkorange"
              break;
          case "POSITIVE":
              color = "forestgreen"
              break;
        }
        return color;
    }
function roundScore(score){
    return parseFloat(score).toFixed(8)
}
function sentimentResults(response){
    return  '<i class = "bi bi-circle-fill" style = "color: '+colorFiller(response.sentiment)+';" ></i>'
                +" <br> Pos: "+ roundScore(response.sentiment_score.Positive)
                +" <br> Neg: "+roundScore(response.sentiment_score.Negative)
                +" <br> Mix: "+roundScore(response.sentiment_score.Mixed)
                +" <br> Neu: "+roundScore(response.sentiment_score.Neutral);
}
function translate(data){
    console.log(data["Dataid"]);
    $.ajax({
        url : apiEndpoint,
        type: "POST",
        contentType: "application/json",
        dataType:"json",
        data : JSON.stringify(data),
        indexValue: {datatype:data["Dataid"]},
        success: function(response) {
            console.log(this.indexValue);
            document.getElementById('translated-' + this.indexValue.datatype).innerHTML = response.translated_text;
            document.getElementById('results-' + this.indexValue.datatype).innerHTML = sentimentResults(response);
            document.getElementById('ent-results-' + this.indexValue.datatype).innerHTML = JSON.stringify(response.entities, null, 4);
            document.getElementById('pii-results-' + this.indexValue.datatype).innerHTML = JSON.stringify(response.pii_entities, null, 4);
        },
        error: function() {
            alert("Internal Error");
            console.log("Internal Error");
        }
    })

}

$(document).ready(function (){
    var langs = [
        {Lang:"Albanian", Code:"sq"}, {Lang:"Arabic", Code:"ar"}, {Lang:"Bosnian", Code:"bs"}, {Lang:"Bulgarian", Code:"bg"},
        {Lang:"Catalan", Code:"ca"}, {Lang:"Chinese", Code:"zh"}, {Lang:"Croatian", Code:"hr"}, {Lang:"Czech", Code:"cs"},
        {Lang:"Danish", Code:"da"}, {Lang:"Dutch", Code:"nl"}, {Lang:"English", Code:"en"}, {Lang:"Estonian", Code:"et"},
        {Lang:"Finnish", Code:"fi"}, {Lang:"French", Code:"fr"}, {Lang:"German", Code:"de"}, {Lang:"Greek", Code:"el"},
        {Lang:"Hungarian", Code:"hu"}, {Lang:"Icelandic", Code:"is"}, {Lang:"Indonesian", Code:"id"}, {Lang:"Italian", Code:"it"},
        {Lang:"Japanese", Code:"ja"}, {Lang:"Korean", Code:"ko"}, {Lang:"Latvian", Code:"lv"}, {Lang:"Lithuanian", Code:"lt"},
        {Lang:"Macedonian", Code:"mk"}, {Lang:"Norwegian", Code:"no"}, {Lang:"Polish", Code:"pl"}, {Lang:"Portuguese", Code:"pt"},
        {Lang:"Romanian", Code:"ro"}, {Lang:"Russian", Code:"ru"}, {Lang:"Serbian", Code:"sr"}, {Lang:"Slovak", Code:"sk"},
        {Lang:"Slovenian", Code:"sl"}, {Lang:"Spanish", Code:"es"}, {Lang:"Swedish", Code:"sv"}, {Lang:"Tagalog", Code:"tl"},
        {Lang:"Thai", Code:"th"}, {Lang:"Turkish", Code:"tr"}, {Lang:"Ukrainian", Code:"uk"}, {Lang:"Vietnamese", Code:"vi"}
    ]
    langs.forEach(rowCreator)
});
$(document).on('focusout', '.text-to-translate', function(){
    if($(this).val()){
        var dataid = $(this).attr("data-id");
        var source_lang = $(this).attr("data-slang");
        var target_lang = "en";
        var text_to_translate = $(this).val();
        var data = {
        "Dataid":dataid,
        "Text":text_to_translate,
        "SourceLanguageCode":source_lang,
        "TargetLanguageCode":target_lang
    };
        translate(data);
    }else {
        alert("Insert text to translate");
    }
});
$(document).on('keyup', '.text-to-translate', function(e){
    if (e.key === 'Enter' || e.keyCode === 13) {
        $(this).blur();
    }
});
