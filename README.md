# Music class Chat

A chat-style web app intended to support a music composition class
(although it could be used for anything).

Copyright (c) The University of Nottingham, 2021.

Author: chris.greenhalgh@nottingham.ac.uk


Status: prototype of user experience, see [todo](docs/todo.md)

See [docs](docs/), including [design](docs/design.md),
[api](docs/api.md) and [views](docs/views.md).

## Build/run

Note, requires [docker](https://docs.docker.com/engine/install/ubuntu/)
and [docker-compse](https://docs.docker.com/compose/install/)

in parts...
```
sudo docker-compose up -d mongo
```
See [test data](docs/test.md)

```
sudo docker-compose up server
```

Open [http://localhosts:3000/](http://localhosts:3000/)

See [test.md](test.md)

