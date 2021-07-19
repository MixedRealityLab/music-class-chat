import {getDb} from "$lib/db";
import {getAdmin, isValidAdminSession} from "$lib/session"
import {LogItem, LogType} from "$lib/types";
import type {AFile} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";
import * as fs from "fs";

export async function post(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params
	const body = req.body as ReadOnlyFormData
	const path = body.get('path')

	if (!gid || !path) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const db = await getDb()
	const deleted = await db.collection<AFile>('Files').deleteOne({path: path})
	if (deleted) {
		fs.rmSync(path)
	}

	await db.collection<LogItem>('EventLog').insertOne({
		timestamp: new Date().getTime(),
		type: LogType.Admin,
		uid: await getAdmin(req),
		content: 'Deleted file ' + path
	})

	return {
		body: await db.collection('Files').find().toArray()
	}
}