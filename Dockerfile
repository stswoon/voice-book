# docker build . -t voice-book:0.0.1
# docker run -p 8085:8085 -e PORT=8085 voice-book:0.0.1

FROM https://dockerhub.timeweb.cloud.stswoon/python-nodejs-silero:python3.9-nodejs18-silero0.4.11

WORKDIR /app
COPY python python
COPY client client
COPY server server
COPY package.json ./
COPY package-lock.json ./
RUN npm run build

EXPOSE ${PORT}
CMD ["node", "server/dist/server.js"]
