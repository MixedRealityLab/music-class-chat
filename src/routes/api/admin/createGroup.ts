import type {Response} from 'express'
import type {ServerRequest} from '../../../_servertypes'
import type {DBGroup} from "../../../_types"
import {readXlsx} from "./[gid]/update";
import {isValidAdminSession} from "./_session"

export async function post(req: ServerRequest, res: Response) {
	try {
		const {name, password} = req.body
		const gid = name.replace(new RegExp('\\s+'), '').toLowerCase()
		const file = req.files.spreadsheet

		if (!gid || !file) {
			res.status(400).json({error: 'Bad Request'})
			return;
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
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
		await req.app.locals.db.collection<DBGroup>('Groups').insertOne(dbgroup)

		await readXlsx(gid, file.data, req.app.locals.db)
		const groups = await req.app.locals.db.collection<DBGroup>('Groups').find().toArray()
		res.json({groups});
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}