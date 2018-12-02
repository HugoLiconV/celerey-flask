// const axios = require('axios');

const tweetsSlider = document.getElementById('tweetsSlider')
const tweets = document.getElementById('tweets')
const hashtag = document.getElementById('hashtag')

document.addEventListener("DOMContentLoaded", function () {
    tweets.innerHTML = tweetsSlider.value
    tweetsSlider.addEventListener('input', function () {
        tweets.innerText = this.value
    })

})

// async function getTweets() {
//     axios.post('/get-tweets', {
//         hashtag: hashtag.value,
//         num_tweets: tweets.innerText
//     }).then(function (response) {
//         console.log(response);
//     }).catch(function (error) {
//         console.log(error);
//     });
//     // const body = JSON.stringify({
//     //     hashtag: hashtag.value,
//     //     num_tweets: tweets.innerText
//     // })
//     //
//     // console.log(body)
//     // const rawResponse = await fetch('http://localhost:5000/get-tweets', {
//     //     mode: 'no-cors',
//     //     method: 'POST',
//     //     headers: {
//     //         'Content-Type': 'application/json',
//     //         acc
//     //     },
//     //     body
//     // })
//     // const content = await rawResponse.json();
//     // console.log(content)
//     // return false
// }

// tweetsSlider.oninput = function() {
//     tweets.innerHTML = this.value
// }
// button = select('#generate');

// DOM element events
// button.mousePressed(generate);
// lengthSlider.input(updateSliders);
// tempSlider.input(updateSliders);
// tweetsSlider.input(updateSliders);
// }

// Update the slider values
// function updateSliders() {
//     // select('#length').html(lengthSlider.value());
//     // select('#temperature').html(tempSlider.value());
//     // select('#temperature').html(tempSlider.value());
//     select('#tweets').html(tweetsSlider.value());
// }
function start_long_task() {
    // add task status elements
    div = $('<div class="progress"><div></div><div>0%</div><div>...</div><div>&nbsp;</div></div><hr>');
    $('#progress').append(div);

    // create a progress bar
    var nanobar = new Nanobar({
        bg: '#44f',
        target: div[0].childNodes[0]
    });

    // send ajax POST request to start background job
    $.ajax({
        type: 'POST',
        url: '/get-tweets',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            hashtag: hashtag.value,
            num_tweets: tweets.innerText
        }),
        success: function (data, status, request) {
            status_url = request.getResponseHeader('Location');
            update_progress(status_url, nanobar, div[0]);
        },
        error: function () {
            alert('Unexpected error');
        }
    });
}

function update_progress(status_url, nanobar, status_div) {
    // send GET request to status URL
    $.getJSON(status_url, function (data) {
        // update UI
        percent = parseInt(data['current'] * 100 / data['total']);
        nanobar.go(percent);
        $(status_div.childNodes[1]).text(percent + '%');
        $(status_div.childNodes[2]).text(data['status']);
        if (data['state'] != 'PENDING' && data['state'] != 'PROGRESS') {
            if ('result' in data) {
                // show result
                $(status_div.childNodes[3]).text(`Result: ${data['result']} tweets downloaded`);
            }
            else {
                // something unexpected happened
                $(status_div.childNodes[3]).text('Result: ' + data['state']);
            }
        }
        else {
            // rerun in 2 seconds
            setTimeout(function () {
                update_progress(status_url, nanobar, status_div);
            }, 2000);
        }
    });
}

$(function () {
    $('#start-bg-job').click(start_long_task);
});
