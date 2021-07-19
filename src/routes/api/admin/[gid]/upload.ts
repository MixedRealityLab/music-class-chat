import {getDb} from "$lib/db";
import {isValidAdminSession} from "$lib/session"
import type {AFile} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";
import {mkdirSync, writeFileSync} from "fs";

export async function post(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params

	if (!gid) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const body = req.body as ReadOnlyFormData
	const fileName = body.getAll('fileName')
	const fileData = body.getAll('fileData')
	if (fileName.length !== fileData.length) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	let fileDocs = []
	mkdirSync('uploads/', {recursive: true})
	for (let i = 0; i < fileData.length; i++) {
		const name = fileName[i]
		const data = fileData[i]
		const doc: AFile = {
			path: 'uploads/' + name
		}
		const buffer = Buffer.from(data, 'base64')
		await writeFileSync(`/app/${doc.path}`, buffer)
		fileDocs.push(doc)
	}

	const db = await getDb()
	await db.collection<AFile>('Files').insertMany(fileDocs)

	return {body: await db.collection('Files').find().toArray()}
}