import type {Response} from 'express'
import * as xlsx from 'xlsx'
import type {ServerRequest} from '../../../../_servertypes'
import type {ChatDef, DBGroup} from "../../../../_types"
import {isValidAdminSession} from "../_session"
import {readChatDefs, readGroup} from "./g/[gid]/update";

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

		const wb = xlsx.read(file.data, {});
		const group = readGroup(wb, sid, gid);
		//console.log(`group`, group);
		const chatdefs = readChatDefs(wb, group);
		//console.log(`chatdefs`, chatdefs);
		// find existing chatdefs
		const oldcds = await req.app.locals.db.collection('ChatDefs').find({groupid: group._id})
			.toArray() as ChatDef[];
		console.log(`found ${oldcds.length} old ChatDefs for group ${group._id}`);

		await req.app.locals.db.collection('Groups').replaceOne({_id: group._id}, group);
		await req.app.locals.db.collection('ChatDefs').deleteMany({groupid: group._id});
		await req.app.locals.db.collection('ChatDefs').insertMany(chatdefs);
		res.json({});
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}