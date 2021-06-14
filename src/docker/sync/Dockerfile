FROM node:alpine
RUN apk add rsync
CMD while :; do rsync -rau --delete /dev/src/ /app/src/; sleep 1s; done;