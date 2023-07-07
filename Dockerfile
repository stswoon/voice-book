FROM nikolaik/python-nodejs:python3.9-nodejs18-slim
RUN pip install silero

WORKDIR /app
COPY python python
COPY server server
RUN cd server && npm ci && npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/dist/server.js"]
