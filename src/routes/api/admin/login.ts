import {base} from '$app/paths'
import {getDb} from "$lib/db";
import type {AdminSession, DBAdmin} from "$lib/types"
import {idAlphabet} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";
import crypto from 'crypto'
import {customAlphabet} from "nanoid"
import nodemailer from 'nodemailer'

const emailConfigured = 'SMTP_host' in process.env
const transport = nodemailer.createTransport({
	host: process.env["SMTP_host"],
	port: parseInt(process.env["SMTP_port"]),
	auth: {
		user: process.env["SMTP_user"],
		pass: process.env["SMTP_pass"]
	}
});

export async function post(req: Request): Promise<EndpointOutput> {
	const body = req.body as ReadOnlyFormData
	const email = body.get('email')
	const password = body.get('password')
	if (!email || !password) {
		return {status: 400, body: {error: 'Bad Request'}}
	}
	const db = await getDb()
	const admin = await db.collection<DBAdmin>('Admins').findOne({_id: email.toLowerCase()})
	if (admin == null) {
		return {status: 404, body: {error: 'Admin Doesn\'t Exist'}}
	}

	const hashed = crypto
		.createHmac('sha512', admin.salt)
		.update(password)
		.digest('base64')
	if (hashed !== admin.password) {
		return {status: 401, body: {error: 'Wrong Password'}}
	}

	const expires = addHours(new Date(), 1)

	const session: AdminSession = {
		id: customAlphabet(idAlphabet, 8)(),
		email: email,
		password: customAlphabet(idAlphabet, 12)(),
		expires: expires.toISOString()
	}

	const sessionUrl = new URL('https://' + req.host + base + '/admin/session?key=' + session.password).toString()

	console.log(sessionUrl)
	await db.collection('AdminSessions').deleteMany({email: email})
	await db.collection('AdminSessions').insertOne(session)
	if (emailConfigured) {
		console.log('Sending Email')
		await transport.sendMail({
			from: process.env['SMTP_email'],
			to: email,
			subject: 'Admin Login',
			text: 'Session: ' + sessionUrl,
			html: '<div><a href="' + sessionUrl + '">Complete Login</a></div>'
		});
	} else {
		console.warn('Emails Not Configured')
	}

	return {body: {message: 'Check email'}}
}

function addHours(date: Date, hours: number) {
	const result = new Date(date)
	result.setTime(result.getTime() + hours * 60 * 60 * 1000)
	return result;
}