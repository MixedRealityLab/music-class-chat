import type {Response} from 'express'
import * as fs from "fs";
import type {ServerRequest} from '../../../../_servertypes'
import type {AFile} from "../../../../_types";
import {isValidAdminSession} from "../_session"

export async function post(req: ServerRequest, res: Response) {
	try {
		const {gid} = req.params
		const {path} = req.body

		if (!gid || !path) {
			res.status(400).json({error: 'Bad Request'})
			return;
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}

		const collection = req.app.locals.db.collection<AFile>('Files')
		const deleted = await collection.deleteOne({path: path})
		if (deleted) {
			fs.rmSync(path)
		}

		const files = await collection.find().toArray()

		res.json(files);
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}