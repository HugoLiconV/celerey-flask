const tweetsSlider = document.getElementById('tweetsSlider')
const tweets = document.getElementById('tweets')
const hashtag = $('#hashtag')

$(document).ready(function () {
    tweets.innerHTML = tweetsSlider.value
    tweetsSlider.addEventListener('input', function () {
        tweets.innerText = this.value
    })

    hashtag.on('input', function () {
        const error_element = $("span", hashtag.parent());
        const value = hashtag.val();
        if (value) {
            hashtag.removeClass("invalid").addClass("valid");
            error_element.removeClass("error_show").addClass("error");
        } else {
            hashtag.removeClass("valid").addClass("invalid");
            error_element.removeClass("error").addClass("error_show");
        }
    });

    $('#tweetsLoaded').change(function () {
        $('#trainModel').prop('disabled', !this.checked)
    });
});


function start_long_task() {
    const error_element = $("span", hashtag.parent());
    const valid = hashtag.hasClass("valid");

    if (!valid) {
        hashtag.removeClass("valid").addClass("invalid");
        error_element.removeClass("error").addClass("error_show");
        return
    } else {
        hashtag.removeClass("invalid").addClass("valid");
        error_element.removeClass("error_show").addClass("error");
    }

    // add task status elements
    let div = $('<div class="progress"><div></div><div>0%</div><div>...</div><div>&nbsp;</div></div><hr>');
    $('#progress').append(div);

    // create a progress bar
    const nanobar = new Nanobar({
        bg: '#9b4dca',
        target: div[0].childNodes[0]
    });

    // send ajax POST request to start background job
    $.ajax({
        type: 'POST',
        url: '/get-tweets',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            hashtag: hashtag.val(),
            num_tweets: tweets.innerText
        }),
        success: (data, status, request) => {
            const status_url = request.getResponseHeader('Location');
            update_progress(status_url, nanobar, div[0]);
        },
        error: () => {
            alert('Unexpected error');
        }
    });
}

function update_progress(status_url, nanobar, status_div) {
    // send GET request to status URL
    $.getJSON(status_url, function (data) {
        // update UI
        let percent = parseInt(data['current'] * 100 / data['total']);
        percent = percent > 100 ? 100 : percent
        nanobar.go(percent);
        $(status_div.childNodes[1]).text(`${percent}%`);
        $(status_div.childNodes[2]).text(data['status']);
        if (data['state'] != 'PENDING' && data['state'] != 'PROGRESS') {
            if ('result' in data) {
                // show result
                $(status_div.childNodes[3]).text(`Result: ${data['result']}`);
                if (!($('#tweetsLoaded').prop('checked'))) {
                    $('#tweetsLoaded').prop('checked', true).change();
                } else if (!($('#modelTrained').prop('checked'))) {
                    $('#modelTrained').prop('checked', true).change();
                }
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

function trainModel() {
    // add task status elements
    let div = $('<div class="progress"><div></div><div>0%</div><div>...</div><div>&nbsp;</div></div><hr>');
    $('#progress').append(div);

    // create a progress bar
    const nanobar = new Nanobar({
        bg: '#9b4dca',
        target: div[0].childNodes[0]
    });

    $.ajax({
        type: 'POST',
        url: '/train-model',
        success: (data, status, request) => {
            const status_url = request.getResponseHeader('Location');
            console.log(data, status, request)
            update_progress(status_url, nanobar, div[0]);
        },
        error: () => {
            alert('Unexpected error');
        }
    });
}


function cleanStatus() {
    $('#progress').empty()
}

function createTweet() {
    const twitterLink = "https://twitter.com/intent/tweet?hashtags=TwitterIA&text=";
    const text = $('#result').text()
    let bodyTweet = encodeURIComponent(text);
    $("#tweet").attr("href", `${twitterLink}${bodyTweet}`);

    $("#tweet").click(function () {
        window.open(this.getAttribute("href"));
    });
}

$(function () {
    $('#start-bg-job').click(start_long_task);
    $('#trainModel').click(trainModel);
    $('#cleanStatus').click(cleanStatus)
    $('#tweet').click(createTweet)
});
