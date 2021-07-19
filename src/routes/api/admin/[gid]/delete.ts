import {getDb} from "$lib/db";
import {isValidAdminSession} from "$lib/session"
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

	return {
		body: await db.collection('Files').find().toArray()
	}
}