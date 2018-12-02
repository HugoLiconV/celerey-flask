# Tweeter API

Using Celery with Flask
=======================

Quick Setup
-----------
1.  Clone the project

    `git clone https://github.com/HugoLiconV/Twiter-IA.git`
2.  Move to folder
    
    `cd Twitter-IA`
3.  Install dependencies
    
    `pip install -r requirements.txt`
4. Write your twitter credentials in `secret.example.py` and then **rename it** to `secret.py`
3. Open a second terminal window and start a local Redis server (if you are on Linux or Mac, execute `run-redis.sh` to install and launch a private copy).
4. Open a third terminal window and start a Celery worker: `celery worker -A app.celery --loglevel=info`.
5. Start the Flask application on your original terminal window: `python app.py`.
6. Go to `http://localhost:5000/`

