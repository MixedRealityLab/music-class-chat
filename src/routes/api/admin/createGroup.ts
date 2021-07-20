import {getDb} from "$lib/db";
import {getAdmin, isValidAdminSession} from "$lib/session"
import {LogItem, LogType} from "$lib/types";
import type {DBGroup} from "$lib/types"
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";
import {readXlsx} from "./[gid]/update";

export async function post(req: Request): Promise<EndpointOutput> {
	const body = req.body as ReadOnlyFormData
	const name = body.get('name')
	const password = body.get('password')
	const gid = name.replace(new RegExp('\\s+'), '').toLowerCase()
	const file = body.get('spreadsheet')
	const buffer = Buffer.from(file, 'base64')

	if (!gid || !file) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const dbgroup: DBGroup = {
		_id: gid,
		name: name,
		description: "",
		password: password,
		rewards: [],
		allowguest: true,
		allowselfenrol: true,
		requireemail: false,
		requireinitials: true,
		requirepin: false,
		showpublic: true
	}
	const db = await getDb()
	await db.collection<DBGroup>('Groups').insertOne(dbgroup)

	await readXlsx(gid, buffer, db)
	await db.collection<LogItem>('EventLog').insertOne({
		timestamp: new Date().getTime(),
		type: LogType.Admin,
		uid: await getAdmin(req),
		content: 'Created Group ' + gid,
		userAgent: req.headers['user-agent']
	})

	return {body: await db.collection('Groups').find().toArray()}
}