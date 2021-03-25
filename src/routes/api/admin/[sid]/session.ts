import crypto from 'crypto'
import type {Response} from "express"
import {customAlphabet} from "nanoid"
import nodemailer from 'nodemailer'
import type {ServerRequest} from "../../../../_servertypes"
import type {AdminSession, DBAdmin, DBSite} from "../../../../_types"

const emailConfigured = 'SMTP.host' in process.env
const transport = nodemailer.createTransport({
	host: process.env["SMTP.host"],
	port: parseInt(process.env["SMTP.port"]),
	auth: {
		user: process.env["SMTP.user"],
		pass: process.env["SMTP.pass"]
	}
});

export async function post(req: ServerRequest, res: Response, next: () => void) {
	try {
		const {sid} = req.params
		const {email, password} = req.body
		if (!sid || !email || !password) {
			res.status(400).json({error: 'Bad Request'})
			return
		}
		const site: DBSite = await req.app.locals.db.collection('Sites').findOne({_id: sid})
		const admin = site.admins.find((admin: DBAdmin) => admin.enabled && admin.email === email)
		if (!admin) {
			res.status(401).json({error: 'Not an Admin'})
			return
		}

		const hashed = crypto
			.createHmac('sha512', admin.salt)
			.update(password)
			.digest('base64')
		if (hashed !== admin.password) {
			res.status(401).json({error: 'Wrong Password'})
			return
		}

		const expires = addDays(new Date(), 31)

		const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		const session: AdminSession = {
			admin: email,
			password: password,
			sessionkey: customAlphabet(alphabet, 8)(),
			sessionexpires: expires.toISOString()
		}
		// Should
		const sessionUrl = req.protocol + '://' + req.host + req.baseUrl + '/admin/'  + sid + '/s/' + session.sessionkey
		await req.app.locals.db.collection('AdminSessions').deleteMany({admin: email})
		await req.app.locals.db.collection('AdminSessions').insertOne(session)
		if(emailConfigured) {
			console.log('Sending Email')
			await transport.sendMail({
				from: process.env['SMTP.email'],
				to: email,
				subject: 'Admin Login',
				text: 'Session: ' + sessionUrl,
				html: '<a href="' + sessionUrl + '">Login</a>'
			});
		} else {
			console.warn('Emails Not Configured')
		}

		res.json({message: 'Check email'});
	} catch (error) {
		console.log('Error (update group)', error);
		res.writeHead(500).end(JSON.stringify({error: error}));
	}
}

function addDays(date, days) {
	let result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}