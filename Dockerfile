FROM nikolaik/python-nodejs:python3.9-nodejs18-slim
WORKDIR /app

COPY python /app/
RUN cd /app/python && pip install -r requirements.txt

COPY server/dist /app/
ENV PORT="8080"
EXPOSE 8080
CMD ["npm", "npm run start"]
