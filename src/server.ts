import * as sapper from '@sapper/server'
import cors from "cors"
import express from "express"
import fileupload from 'express-fileupload'
import session from 'express-session'
import * as http from "http"
import {MongoClient} from "mongodb"
import SessionFileStore from 'session-file-store'
import type {ServerRequest} from './_servertypes'

const {PORT, MONGODB, BASEPATH} = process.env
const basePath = BASEPATH ?? ''
const app = express()

let FileStore = (SessionFileStore)(session)
let fileStoreOptions = {}

console.log(`base path: ${basePath}`)
app.use(`${basePath}/uploads`, express.static('uploads'))
app.use(
	basePath,
	express.static('static'),
	cors(),
	express.json(),
	fileupload({
		limits: {fileSize: 2 * 1024 * 1024},
		//useTempFiles : true,
		//tempFileDir : '/tmp/'
	}),
	session({
		secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'notverysecret',
		resave: false,
		saveUninitialized: false,
		/* cookie: { secure: true }, */
		/* mainly for dev (restartable) */
		store: new FileStore(fileStoreOptions),
	}),
	sapper.middleware({
		session: (req: ServerRequest, res: sapper.SapperResponse) => ({
			sessionid: req.session.sessionid
			//userid: req.session.userid,
		})
	})
)

let delay = 1000;
const attemptConnection = function () {
	MongoClient.connect(MONGODB ? MONGODB : 'mongodb://mongo:27017', {useUnifiedTopology: true})
		.then((client) => {
			console.log("Connected to DB")
			app.locals.db = client.db('music-class-chat')

			const server = http.createServer(app)
			server.listen(PORT)
			server.on('error', (error) => {
				throw error
			})
		})
		.catch((err) => {
			console.log(err.message)
			setTimeout(attemptConnection, delay)
		})
}

attemptConnection();