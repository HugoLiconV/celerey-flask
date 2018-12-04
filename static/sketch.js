let charRNN;
let textInput;
let lengthSlider;
let tempSlider;
let button;
let runningInference = false;
let modelTrainedCB;
let modelLoadedCB

function setup() {
    noCanvas();
    textInput = select('#textInput');
    lengthSlider = select('#lenSlider');
    tempSlider = select('#tempSlider');
    button = select('#generate');
    modelTrainedCB = $('#modelTrained')
    modelLoadedCB = $('#modelLoaded')
    button.mousePressed(generate);
    lengthSlider.input(updateSliders);
    tempSlider.input(updateSliders);
}


$(document).ready(function () {

    $('#modelTrained').change(function () {
        // Create the LSTM Generator passing it the model directory
        charRNN = ml5.charRNN('./static/data/', modelReady);
    });
})

// Update the slider values
function updateSliders() {
    select('#length').html(lengthSlider.value());
    select('#temperature').html(tempSlider.value());
}

function modelReady() {
    select('#status').html('Model Loaded');
    $('#generate').prop('disabled', false)
    $('#modelLoaded').prop('checked', true)
}

// Generate new text
function generate() {
    // prevent starting inference if we've already started another instance
    // TODO: is there better JS way of doing this?
    if (!runningInference) {
        runningInference = true;

        // Update the status log
        select('#status').html('Generating...');

        // Grab the original text
        let original = textInput.value();
        // Make it to lower case
        let txt = original.toLowerCase();

        // Check if there's something to send
        if (txt.length > 0) {
            // This is what the LSTM generator needs
            // Seed text, temperature, length to outputs
            // TODO: What are the defaults?
            let data = {
                seed: txt,
                temperature: tempSlider.value(),
                length: lengthSlider.value()
            };

            // Generate text with the charRNN
            charRNN.generate(data, gotData);

            // When it's done
            function gotData(err, result) {
                // Update the status log
                select('#status').html('Ready!');
                select('#result').html(txt + result.sample);
                $('#tweet').prop('disabled', false)
                runningInference = false;
            }
        }
    }
}
