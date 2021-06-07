FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY *.json /app/
RUN npm install --production=false
COPY *.config.js *.config.cjs /app/
COPY ./src/ /app/src
COPY ./static/ /app/static
RUN npm run build
RUN npm prune --production
EXPOSE 3000
CMD npm start
