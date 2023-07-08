# docker build . -t voice-book:0.0.1

FROM stswoon/python-nodejs-silero:python3.9-nodejs18-silero0.4.11

WORKDIR /app
COPY python python
COPY server server
RUN cd server && npm ci && npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/dist/server.js"]
