# voice-book

based on https://silero.ai/ - https://github.com/snakers4/silero-models

pip install -r requirements.txt
pip freeze > requirements.txt

docker build . -t voice-book:0.0.1




TODO more fancy ui
TODO prettify code
TODO docs


TODO read port from env vars in docker, because it needs for health-check on 10000 port + also it's not good to hardcode this value

TODO eng to translit
