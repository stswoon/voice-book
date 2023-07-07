FROM nikolaik/python-nodejs:python3.9-nodejs18-slim
#RUN pip install silero==0.4.1

WORKDIR /app
COPY python python
COPY server server
RUN cd server && npm ci && npm run build

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server/dist/server.js"]
