import type {Response} from "express";
import type {ServerRequest} from "../../../../../../_servertypes";
import type {DBUser} from "../../../../../../_types";
import {isValidAdminSession} from "../../../_session";

export async function get(req: ServerRequest, res: Response) {
	try {
		const {sid, gid} = req.params
		if (!sid || !gid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}
		const users = await req.app.locals.db.collection<DBUser>('Users').find(
			{groupid: `${sid}/${gid}`}
		).toArray()
		users.forEach(user => {
			delete user.group
			delete user.groupid
			delete user.rewards
			delete user.chats
			delete user.pin
			delete user.content
		})
		return res.json(users)
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}