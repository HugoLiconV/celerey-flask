import random
import time
# from twitter-api import fetch_tweets
from flask_cors import CORS
from flask import Flask, request, url_for, jsonify, render_template
from celery import Celery
from twitter import fetch_tweets
from tasks import make_celery

app = Flask(__name__)
CORS(app)
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

# app.config.update(
#     CELERY_BROKER_URL='redis://localhost:6379/0',
#     CELERY_RESULT_BACKEND='redis://localhost:6379/0'
# )

# app.config.update(
#     CELERY_BROKER_URL='amqp://localhost/',
#     CELERY_RESULT_BACKEND='amqp://localhost/'
# )
# celery = make_celery(app)
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])

celery.conf.update(app.config)


@app.route('/', methods=['GET'])
def index():
    if request.method == 'GET':
        return render_template('index.html')


@app.route('/get-tweets', methods=['POST'])
def get_tweets():
    results = request.get_json()
    hashtag = results['hashtag']
    num_tweets = int(results['num_tweets'])
    task = get_tweets_from_api.delay(hashtag=hashtag, num_tweets=num_tweets)
    return jsonify(taskid=task.id), 202, {'Location': url_for('taskstatus',
                                                              task_id=task.id)}


@celery.task(bind=True)
def get_tweets_from_api(self, hashtag, num_tweets):
    return fetch_tweets(searchQuery=hashtag, celery=self, num_tweets=num_tweets)

@app.route('/status/<task_id>')
def taskstatus(task_id):
    task = get_tweets_from_api.AsyncResult(task_id)
    if task.state == 'PENDING':
        # job did not start yet
        response = {
            'state': task.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 1),
            'status': task.info.get('status', '')
        }
        if 'result' in task.info:
            response['result'] = task.info['result']
    else:
        # something went wrong in the background job
        response = {
            'state': task.state,
            'current': 1,
            'total': 1,
            'status': str(task.info),  # this is the exception raised
        }
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
