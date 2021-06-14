import type {Response} from "express";
import type {ServerRequest} from "../../../../../_servertypes";
import type {DBUser} from "../../../../../_types";
import {isValidAdminSession} from "../../_session";

export async function get(req: ServerRequest, res: Response) {
	try {
		const {gid, uid} = req.params
		if (!gid || !uid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}
		const user = await req.app.locals.db.collection<DBUser>('Users').findOne(
			{_id: `${gid}/${uid}`}
		)
		delete user.group
		delete user.chats
		delete user.pin
		delete user.content
		return res.json(user)
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}