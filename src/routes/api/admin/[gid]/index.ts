import type {Response} from "express";
import type {ServerRequest} from "../../../../_servertypes";
import type {AFile, DBGroup, DBUser} from "../../../../_types";
import {isValidAdminSession} from "../_session";

export async function get(req: ServerRequest, res: Response) {
	try {
		const {gid} = req.params
		if (!gid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
			return
		}
		const group = await req.app.locals.db.collection<DBGroup>('Groups').findOne({_id: gid})
		if (group == null) {
			res.status(404).json({error: 'Group Doesn\'t Exist'})
			return
		}

		const users = await req.app.locals.db.collection<DBUser>('Users').find({groupid: gid}).toArray()
		users.forEach(user => {
			delete user.group
			delete user.groupid
			delete user.rewards
			delete user.chats
			delete user.pin
			delete user.content
		})
		const files = await req.app.locals.db.collection<AFile>('Files').find().toArray()
		return res.json({users: users, files: files})
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}