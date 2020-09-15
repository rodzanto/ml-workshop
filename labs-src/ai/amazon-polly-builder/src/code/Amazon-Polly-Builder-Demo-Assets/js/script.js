// Select tag editor


$(".tooltiper").on("mouseover", function () {
    $(this).tooltip('show');
});

$(document).on('click', '.sidebar-option', function(){
    if($(this).attr('data-type')==="intro") {
        $('#features-section').hide();
        $('#introduction-section').show();
    }else{
        $('#introduction-section').hide();
        $('#features-section').show();
        $('.featureoptions').hide();
        $('#'+$(this).attr('data-type')+'builder').css('display', 'contents');
    }
    $('.sidebar-option.active').removeClass( "active" );
    $(this).addClass("active");
});

// Insert speak tag

$(document).on('click', '.insertTag', function(){
    let examples = {
        speak: "<speak>This is an example</speak>",
        break1:  "<speak>This is a pause <break time='"+$('#break-time-val').val()+"s'/> example </speak>",
        break2: "<speak>This is a pause <break strength='"+$("input[name='break-strength-opt']:checked").val()+"'/> example </speak>",
        breath1: "<speak> Sometimes you want to insert only <amazon:breath duration='"+$('#breath-manual-duration').val()+"' volume='"+$('#breath-manual-volume').val()+"'/>a single breath.</speak>",
        breath2: "<speak><amazon:auto-breaths volume='"+$('#breath-auto-volume').val()+"' frequency='"+$('#breath-auto-frequency').val()+"' duration='"+$('#breath-auto-duration').val()+"'>Amazon Polly is a service that turns text into lifelike speech, allowing you to create applications that talk and build entirely new categories of speech-enabled products. Amazon Polly is a text-to-speech service, that uses advanced deep learning technologies to synthesize speech that sounds like a human voice.</amazon:auto-breaths></speak>",
        emphasis: "<speak> I already told you I <emphasis level='"+$("input[name='emphasis-strength']:checked").val()+"'> really like</emphasis> that person.</speak>",
        phoneme: "<speak> You say, <phoneme alphabet='"+$("input[name='phoneme-alphabet']:checked").val()+"' ph='"+$('#phoneme-ph').val()+"'>"+$('#phoneme-word').val()+"</phoneme>.</speak>",
        prosody: "<speak> The following text will be altered <prosody rate='"+$('#prosody-rate').val()+"' volume='"+$('#prosody-volume').val()+"' pitch='"+$('#prosody-pitch').val()+"'>Now you have a different rate, volume and pitch</prosody></speak>",
        language: "<speak> The correct way to say it is <lang xml:lang='"+$('#language-id').val()+"'>"+$('#language-text').val()+"</lang>.</speak>",
        abbreviation: "<speak>My favorite chemical element is <sub alias='"+$('#abbreviation-alias').val()+"'>"+$('#abbreviation-abbreviation').val()+"</sub>, because it looks so shiny.</speak>",
        whisper: "<speak><amazon:effect name='whispered'>This is a whisper example</amazon:effect></speak>",
        phonation: "<speak>This is my normal speaking voice <amazon:effect phonation='soft'>This is me speaking in my softer voice.</amazon:effect></speak>"
    };

    if($(this).attr('data-type') === 'break' || $(this).attr('data-type') === 'breath'){
        var example = $(this).attr('data-type') + $(this).attr('data-number');
        $('#ta-'+ $(this).attr('data-type')).val(examples[example]);
    }else{
        $('#ta-'+ $(this).attr('data-type')).val(examples[$(this).attr('data-type')]);
    }

});


// Play audio

$(document).on('click', '.speakButton', function(){
    var language = $('#language-selection option:selected').attr("data-language");
    var voiceid = $('#language-selection').val();

    var datatype = $(this).attr('data-type');
    var data = {
        "text":$("#ta-"+datatype).val(),
        "languagecode":language,
        "voiceid":voiceid
    };


    $.ajax({
        url : apiEndpoint,
        type: "POST",
        contentType: "application/json",
        dataType:"json",
        data : JSON.stringify(data),
        indexValue: {datatype:datatype},
        success: function(response) {
            console.log(response);
            document.getElementById(this.indexValue.datatype+'audioSource').src = response;
            document.getElementById(this.indexValue.datatype+'audioPlayback').load();
            document.getElementById(this.indexValue.datatype+'audioPlayback').play();
        },
        error: function() {
            alert("Internal Error");
            console.log("Internal Error");
        }
    })
});

// Download audio

$(document).on('click', '.downloadButton', function(){
    let datatype = $(this).attr('data-type');
    window.open($('#'+datatype+'audioSource').attr("src"),'_blank');

});

// Insert test into result

$(document).on('click', '.insertButton', function(){
    $('#ta-result').val("<speak>"+$('#ta-result').val().replace(/<\/?speak>/g,'')+$('#ta-'+$(this).attr('data-type')).val().replace(/<\/?speak>/g,'')+" </speak>");
});

// Delete result content

$(document).on('click', '.deleteButton', function(){
    $('#ta-result').val("<speak></speak>");
});

// Break time slider

$(document).on('input change', '#break-time-range', function(){
    $('#break-time-val').val($('#break-time-range').val());
});

$(document).on('input change', '#break-time-val', function(){
    $('#break-time-range').val($('#break-time-val').val());
});

