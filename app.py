import random
import time
# from twitter-api import fetch_tweets
from flask import Flask, request, url_for, jsonify, render_template
from celery import Celery
from twitter import fetch_tweets
from tasks import make_celery

app = Flask(__name__)
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


@app.route('/longtask', methods=['POST'])
def longtask():
    task = long_task.apply_async()
    print(task.id)
    return jsonify({}), 202, {'Location': url_for('taskstatus',
                                                  task_id=task.id)}


@app.route('/status/<task_id>')
def taskstatus(task_id):
    task = long_task.AsyncResult(task_id)
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


@celery.task(bind=True)
def long_task(self):
    """Background task that runs a long function with progress reports."""
    verb = ['Starting up', 'Booting', 'Repairing', 'Loading', 'Checking']
    adjective = ['master', 'radiant', 'silent', 'harmonic', 'fast']
    noun = ['solar array', 'particle reshaper', 'cosmic ray', 'orbiter', 'bit']
    message = ''
    total = random.randint(10, 50)
    for i in range(total):
        if not message or random.random() < 0.25:
            message = '{0} {1} {2}...'.format(random.choice(verb),
                                              random.choice(adjective),
                                              random.choice(noun))
        self.update_state(state='PROGRESS',
                          meta={'current': i, 'total': total,
                                'status': message})
        time.sleep(1)
    return {'current': 100, 'total': 100, 'status': 'Task completed!',
            'result': 42}


if __name__ == '__main__':
    app.run(debug=True)
