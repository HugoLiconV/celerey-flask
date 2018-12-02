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

async function getTweets() {
    axios.post('http://localhost:5000/get-tweets', {
        hashtag: hashtag.value,
        num_tweets: tweets.innerText
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.log(error);
    });
    // const body = JSON.stringify({
    //     hashtag: hashtag.value,
    //     num_tweets: tweets.innerText
    // })
    //
    // console.log(body)
    // const rawResponse = await fetch('http://localhost:5000/get-tweets', {
    //     mode: 'no-cors',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         acc
    //     },
    //     body
    // })
    // const content = await rawResponse.json();
    // console.log(content)
    // return false
}

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
