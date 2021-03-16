FROM node:alpine AS build
RUN mkdir /app
RUN mkdir /app/src
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install
COPY *.config.js tsconfig.json /app/
COPY ./src/ /app/src
COPY ./static/ /app/static
ENV NODE_ENV=production
ARG BASEPATH
ENV BASEPATH=${BASEPATH:-}
RUN npm run build

FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
ENV NODE_ENV=production
RUN npm install
COPY ./static/ /app/static
COPY --from=build /app/__sapper__/build /app/__sapper__/build/
VOLUME /app/static/upload/
EXPOSE 3000
ENV BASEPATH=${BASEPATH:-}
CMD ["npm", "start"]
