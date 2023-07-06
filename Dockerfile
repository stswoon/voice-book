FROM nikolaik/python-nodejs:python3.9-nodejs18-slim
WORKDIR /app

COPY python/requirements.txt    /app/python
COPY python/silerotest.py       /app/python
COPY python/tts-model.pt        /app/python
COPY python/bookRuns/.keepgit   /app/python/bookRuns/.keepgit
RUN cd /app/python && pip install -r requirements.txt

COPY server/src /app/server/src
RUN cd /app/server/src && npm run build

ENV PORT="8080"
EXPOSE 8080
CMD ["npm", "cd server && npm run start"]
