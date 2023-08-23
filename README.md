# voice-book

based on https://silero.ai/ - https://github.com/snakers4/silero-models

pip install -r requirements.txt
pip freeze > requirements.txt

docker build . -t voice-book:0.0.1




TODO docs


refactor server code
silero update to v4 - https://habr.com/ru/articles/754772/ - fail - twice slower and quality worse and no new good voice pert or caleria like in telegram bot
support queue - 5
support text split, multidownload button
add info save only 24h
fix long sentence with enters
use 2 threads, dynamic pull 1-2 per man
add max symbols, e.g. 100k
add link to silero, send email
read license again
add yandex metrics
add email
add mobile layout



