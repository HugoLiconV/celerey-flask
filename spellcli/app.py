import spell.client
import time
import os
import re


def train_model_spell(celery):
    client = spell.client.from_environment()
    requirements = [
        "numpy==1.10.4",
        "scipy==0.17.0",
        "tensorflow==1.0.0",
        "certifi==2018.8.24",
        "chardet==3.0.4",
        "idna==2.7",
        "jsonpickle==1.0",
        "oauthlib==2.1.0",
        "PySocks==1.6.8",
        "python-dotenv==0.9.1",
        "requests==2.19.1",
        "requests-oauthlib==1.0.0",
        "six==1.11.0",
        "tweepy==3.6.0",
        "urllib3==1.23"
    ]
    celery.update_state(state='PROGRESS',
                        meta={'current': 0, 'total': 3,
                              'status': 'Removing old files...'})
    try:
        client.api.remove_dataset('corpus')
    except:
        celery.update_state(state='PROGRESS',
                            meta={'current': 0, 'total': 3,
                                  'status': 'File already deleted'})

        celery.update_state(state='PROGRESS',
                            meta={'current': 0, 'total': 3,
                                  'status': 'Uploading new files...'})
    os.system("spell upload --name 'corpus' ./input.txt")
    time.sleep(3)
    git_hash = "09a80cd8bc9ca8ce18eb9e4c59e4ba8a2a1ac72f"
    run = client.runs.new(command="python train.py --data_dir=./data",
                          workspace_id=1,
                          commit_hash=git_hash,
                          attached_resources={"uploads/corpus": "/training-lstm/data"},
                          pip_packages=requirements)

    for line in run.logs():
        numbers = [0, 0]
        print(line)
        m = re.search('\d+\/\d+', str(line))
        if m:
            numbers = m.group(0).split('/')
        current = int(numbers[0])
        total = int(numbers[1])
        celery.update_state(state='PROGRESS',
                            meta={'current': current, 'total': total,
                                  'status': 'Training...'})

    run.wait_status(client.runs.COMPLETE)
    run.refresh()
    celery.update_state(state='PROGRESS',
                        meta={'current': 1, 'total': 1,
                              'status': 'Coping files...'})
    run.cp(source_path='models', destination_directory='./static/')
    return {'current': 1,
            'total': 1,
            'status': 'Task completed!',
            'result': 'Model Trained'}
