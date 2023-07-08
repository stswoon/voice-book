# docker build . -t stswoon/python-nodejs-silero:python3.9-nodejs18-silero0.4.11
# docker login
# docker image push stswoon/python-nodejs-silero:python3.9-nodejs18-silero0.4.11

FROM nikolaik/python-nodejs:python3.9-nodejs18-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
