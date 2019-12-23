var langs =
[['Afrikaans',       ['af-ZA']],
['Bahasa Indonesia',['id-ID']],
['Bahasa Melayu',   ['ms-MY']],
['Hindi',           ['hi-IN']],
['Bengali',         ['bn-IN']],
['Deutsch',         ['de-DE']],
['English',         ['en-AU', 'Australia'],
                    ['en-CA', 'Canada'],
                    ['en-IN', 'India'],
                    ['en-NZ', 'New Zealand'],
                    ['en-ZA', 'South Africa'],
                    ['en-GB', 'United Kingdom'],
                    ['en-US', 'United States']],
['Español',         ['es-AR', 'Argentina'],
                    ['es-BO', 'Bolivia'],
                    ['es-CL', 'Chile'],
                    ['es-CO', 'Colombia'],
                    ['es-CR', 'Costa Rica'],
                    ['es-EC', 'Ecuador'],
                    ['es-SV', 'El Salvador'],
                    ['es-ES', 'España'],
                    ['es-US', 'Estados Unidos'],
                    ['es-GT', 'Guatemala'],
                    ['es-HN', 'Honduras'],
                    ['es-MX', 'México'],
                    ['es-NI', 'Nicaragua'],
                    ['es-PA', 'Panamá'],
                    ['es-PY', 'Paraguay'],
                    ['es-PE', 'Perú'],
                    ['es-PR', 'Puerto Rico'],
                    ['es-DO', 'República Dominicana'],
                    ['es-UY', 'Uruguay'],
                    ['es-VE', 'Venezuela']],
['Euskara',         ['eu-ES']],
['Français',        ['fr-FR']],
['Galego',          ['gl-ES']],
['Hrvatski',        ['hr_HR']],
['IsiZulu',         ['zu-ZA']],
['Íslenska',        ['is-IS']],
['Italiano',        ['it-IT', 'Italia'],
                    ['it-CH', 'Svizzera']],
['Magyar',          ['hu-HU']],
['Nederlands',      ['nl-NL']],
['Norsk bokmål',    ['nb-NO']],
['Polski',          ['pl-PL']],
['Português',       ['pt-BR', 'Brasil'],
                    ['pt-PT', 'Portugal']],
['Română',          ['ro-RO']],
['Slovenčina',      ['sk-SK']],
['Suomi',           ['fi-FI']],
['Svenska',         ['sv-SE']],
['Türkçe',          ['tr-TR']],
['български',       ['bg-BG']],
['Català',          ['ca-ES']],
['Čeština',         ['cs-CZ']],
['Pусский',         ['ru-RU']],
['Српски',          ['sr-RS']],
['한국어',            ['ko-KR']],
['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                    ['cmn-Hans-HK', '普通话 (香港)'],
                    ['cmn-Hant-TW', '中文 (台灣)'],
                    ['yue-Hant-HK', '粵語 (香港)']],
['日本語',           ['ja-JP']],
['Lingua latīna',   ['la']]];


// Config Variables
var blink = "";
var btn_selector = "";

var final_span_class = "";
var interim_span_class = "";

var on_result = function(transcript){};
var on_interim = function(original_transcript, interim_transcript){};

var on_start = function(){};
var on_stop = function(){};

var on_error = function(error){};


// Pre Configuration
for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;

function updateCountry() {
for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
}
var list = langs[select_language.selectedIndex];
for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
}
select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

// Util functions
function countWords(s){
    s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
    s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
    return s.split(' ').filter(function(str){return str!="";}).length;
    //return s.split(' ').filter(String).length; - this can also be used
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
return s.replace(first_char, function(m) { return m.toUpperCase(); });
}


// Engine Functions
if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        if(recognizing)
            return;
        recognizing = true;
        on_start();
        on_result("", "");
    };

    recognition.onerror = function(event) {
        on_error(event.error);
        if (event.error == 'no-speech') {
            alert('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            alert('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                alert('info_blocked');
            } else {
                alert('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function() {
        
        if(recognizing)
        {
            recognition.start();
        } else {
            recognizing = false;
            // on_result("", "");
            on_stop();
        }
        if (ignore_onend) {
        return;
        }
        if (!final_transcript) {
        return;
        }
    };

    recognition.onresult = function(event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        on_interim(final_transcript, interim_transcript);
        on_result(final_transcript);
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);
        if (final_transcript || interim_transcript) {
        }
    };
}

function start(event){
    if (recognizing) {
        recognizing = false;
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    final_span = $(final_span_class)[0];
    interim_span = $(interim_span_class)[0];
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_timestamp = event.timeStamp;
}

function upgrade() {
    
}

function single_startRecognitionOnClick(config)
{
    btn_selector = config['start_button_selector'] || "";

    final_span_class = config['final_selector'] || ".final_span";
    interim_span_class = config['interim_selector'] || ".interim_span";

    on_result = config['on_result'] || function(transcript){};
    on_interim = config['on_interim'] || function(original_transcript, interim_transcript){};

    on_start = config['on_start'] || function(){};
    on_stop = config["on_stop"] || function(){};

    on_error = config["on_error"] || function(error){};

    $(btn_selector).on('click', function(event){start(event);});
}

function startRecognitionOnClick(config){
    if((config["multiple_config"] || "") != "")
    {
        config["multiple_config"].forEach(_config => {
            
            btn_selector = _config['start_button_selector'] || "";
            $(btn_selector).on('click', function(event){
                extract_configuration(_config);
                start(event);
            });
        });
    }
    else{
        single_startRecognitionOnClick(config);
    }
}

function extract_configuration(config){
    final_span_class = config['final_selector'] || ".final_span";
    interim_span_class = config['interim_selector'] || ".interim_span";

    on_result = config['on_result'] || function(transcript){};
    on_interim = config['on_interim'] || function(original_transcript, interim_transcript){};

    on_start = config['on_start'] || function(){};
    on_stop = config["on_stop"] || function(){};

    on_error = config["on_error"] || function(error){};
}

function add_speech_synthesis_handler(config){
    speak_button = config["trigger_event_selector"] || ".speak";
    speak_from = config["speak_from_selector"] || ".to_speak";
    voice_selector = config["voice_selector"] || "";
    populate_voice_selector = config["populate_voice_selector"] || false;
    voice = config["voice"] || "Google UK English Female";
    on_speak = config["on_speak"] || function(transcript) {};

    if(populate_voice_selector == true)
        populateVoiceList($(voice_selector)[0], voice);
    else{
        if(voice_selector == ""){
            var vs = document.createElement("select");
            vs.hidden = true;
            vs.setAttribute("style", "display: none;");
            vs.setAttribute("id", "voice_selector");
            document.appendChild(vs);
            voice_selector = "#voice_selector";
        }
        populateVoiceList($(voice_selector)[0], voice)
    }
    $(speak_button).on("click", function(event){
        var speech = $(speak_from)[0].innerHTML;
        var utterThis = new SpeechSynthesisUtterance(speech);
        var selectedOption = $(voice_selector)[0].selectedOptions[0].getAttribute('data-name');
        var voices = synth.getVoices();
        for(i = 0; i < voices.length ; i++) {
            if(voices[i].name === selectedOption) {
            utterThis.voice = voices[i];
            }
        }
        synth.speak(utterThis);
    });
}

var synth = window.speechSynthesis;

function populateVoiceList(voiceSelect, default_voice = "Google UK English Female") {
    voices = synth.getVoices();
    voiceSelect = $(voiceSelect)[0];
    for(i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        //option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
        option.textContent = voices[i].name;
        
        if(voices[i].default) {
        //option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.value = default_voice;
    if (speechSynthesis.onvoiceschanged !== undefined)
    {
        speechSynthesis.onvoiceschanged = function(event){
            populateVoiceList(voiceSelect, default_voice);
        };
    }
}
