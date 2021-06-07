import type {Response} from 'express'
import type {ServerRequest} from '../../../../_servertypes'
import type {DBGroup} from "../../../../_types"
import {isValidAdminSession} from "../_session"
import {readXlsx} from "./g/[gid]/update";

export async function post(req: ServerRequest, res: Response) {
	try {
		const {sid} = req.params
		const {name, password} = req.body
		const gid = name.replace(new RegExp('\\s+'), '').toLowerCase()
		const file = req.files.spreadsheet

		if (!sid || !gid || !file) {
			res.status(400).json({error: 'Bad Request'})
			return;
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}

		const dbgroup: DBGroup = {
			_id: sid + "/" + gid,
			id: gid,
			sid: sid,
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

		await readXlsx(sid, gid, file.data, req.app.locals.db)
		const groups = await req.app.locals.db.collection<DBGroup>('Groups').find({sid: sid}).toArray()
		res.json({groups});
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}