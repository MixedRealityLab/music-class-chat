FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY *.json /app/
RUN npm install --production=false
COPY *.config.js /app/
CMD npm run dev
