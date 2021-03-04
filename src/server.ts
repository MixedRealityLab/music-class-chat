import * as sapper from '@sapper/server';
import express from "express";
import * as http from "http";
import logger from "morgan";
import {MongoClient} from "mongodb";
import cors from "cors";
import session from 'express-session';
import SessionFileStore from 'session-file-store';

const {PORT} = process.env;
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');

let FileStore = (SessionFileStore)(session);
let fileStoreOptions = {};

app.use(express.static('static'));
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(session({
	secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'notverysecret',
	resave: false,
	saveUninitialized: true,
	/* cookie: { secure: true }, */
	/* mainly for dev (restartable) */
	store: new FileStore(fileStoreOptions),
}));
app.use(sapper.middleware({
	session: (req:sapper.SapperRequest, res:sapper.SapperResponse) => ({
		//userid: req.session.userid,
	})
}));

let delay = 1000;
const attemptConnection = function () {
	MongoClient.connect('mongodb://mongo:27017', {useUnifiedTopology: true})
		.then((client) => {
			console.log("Connected to DB");
			app.locals.db = client.db('music-class');

			const server = http.createServer(app);
			server.listen(PORT);
			server.on('error', (error) => {
				throw error;
			});
		})
		.catch((err) => {
			console.log(err.message);
			setTimeout(attemptConnection, delay);
		});
};

attemptConnection();
