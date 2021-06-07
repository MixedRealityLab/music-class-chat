import type {Response} from 'express'
import type {UploadedFile} from "express-fileupload";
import {mkdirSync} from "fs";
import type {ServerRequest} from '../../../../../../_servertypes'
import type {AFile} from "../../../../../../_types";
import {isValidAdminSession} from "../../../_session"

export async function post(req: ServerRequest, res: Response) {
	try {
		const {sid, gid} = req.params

		if (!sid || !gid) {
			res.status(400).json({error: 'Bad Request'})
			return;
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}

		let fileArray: UploadedFile[]
		if (Array.isArray(req.files.files)) {
			fileArray = req.files.files
		} else {
			fileArray = [req.files.files]
		}

		let fileDocs = []
		mkdirSync(`uploads/${sid}`, {recursive: true})
		for (const file of fileArray) {
			const doc: AFile = {
				path: `uploads/${sid}/${file.name}`
			}
			await file.mv(`/app/${doc.path}`)
			fileDocs.push(doc)
		}

		const collection = req.app.locals.db.collection<AFile>('Files')
		await collection.insertMany(fileDocs)
		const files = await collection.find().toArray()

		res.json(files);
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}