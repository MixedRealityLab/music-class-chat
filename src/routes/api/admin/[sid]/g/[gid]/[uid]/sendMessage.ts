import type {Response} from "express";
import type {ServerRequest} from "../../../../../../../_servertypes";
import type {DBUser} from "../../../../../../../_types";
import {isValidAdminSession} from "../../../../_session";

export async function post(req: ServerRequest, res: Response) {
	try {
		const {sid, gid, uid} = req.params
		const message = req.body.message
		if (!sid || !gid || !uid || !message) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}

		if (uid === 'all') {
			const groupid = `${sid}/${gid}`
			const users = await req.app.locals.db.collection<DBUser>('Users').find({groupid: groupid}).toArray()
			const messageItem = {
				fromUser: false,
				read: false,
				text: message,
				timestamp: new Date().toISOString()
			}
			for(const user of users) {
				if (!user.messages) {
					user.messages = []
				}
				user.messages.push(messageItem)
				await req.app.locals.db.collection<DBUser>('Users').replaceOne({_id: user._id}, user)
			}
		} else {
			const filter = {_id: `${sid}/${gid}/${uid}`}
			const user = await req.app.locals.db.collection<DBUser>('Users').findOne(
				filter
			)
			if (user == null) {
				res.status(404).json({error: 'User Not Found'})
			}
			if (!user.messages) {
				user.messages = []
			}
			user.messages.push({
				fromUser: false,
				read: false,
				text: message,
				timestamp: new Date().toISOString()
			})
			await req.app.locals.db.collection<DBUser>('Users').replaceOne(filter, user)
			delete user.group
			delete user.chats
			delete user.pin
			delete user.content
			return res.json(user)
		}

	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}