FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
ENV NODE_ENV=development
RUN npm install
COPY *.config.js tsconfig.json /app/
ENV BASEPATH=
CMD ["npm", "run", "dev"]
