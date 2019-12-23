# voicemeJS
A Speech Recognition and Speech Synthesis JavaScript utility library that exponentially lowers your effort in creating voice responsive applications 
-----

## Speech Recognition
```
    startRecognitionOnClick({
    "multiple_config": [
        {
            "start_button_selector": ".start",   // on click of this button, the recognition will start
            "final_selector": "p.final_span",   // the element where the final transcript result will be printed
            "interim_selector": "div.interim_span",   // the element where the instantaneous transcript result will be printed 
            "on_start": function() {
                // triggered while starting the recognition engine...
                $("span.duck").addClass("listening-class");
            },
            "on_stop": function() {
                // triggered while stoping the recognition engine...
                $("span.duck").removeClass("not-listening-class");
            }
        },
        ...
    ]
    });
```

## Speech Synthesizer
```
    add_speech_synthesis_handler({
        "trigger_event_selector": ".speak-text",   // text will be spoken when the object is clicked
        "speak_from_selector": "#raw_transcript",   // selector from where text will be selected
        "voice_selector": "#voiceselect",   // selector from where the voice will be selected
        "populate_voice_selector": true,   // available voice profiles will be loaded in "voice_selector"
        "onspeak": function(transcript){
            // triggered when speech will start synthesizing
            console.log("speaking...");
        }
    });
```