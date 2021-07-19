import {getDb} from "$lib/db";
import {getAdmin, isValidAdminSession} from "$lib/session";
import type {DBUser} from "$lib/types";
import {LogItem, LogType} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";

export async function post(req: Request): Promise<EndpointOutput> {
	const {gid, uid} = req.params
	const body = req.body as ReadOnlyFormData
	const message = body.get('message')
	if (!gid || !uid || !message) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const db = await getDb()
	if (uid === 'all') {
		const users = await db.collection<DBUser>('Users').find({groupid: gid}).toArray()
		const messageItem = {
			fromUser: false,
			read: false,
			text: message,
			timestamp: new Date().toISOString()
		}
		for (const user of users) {
			if (!user.messages) {
				user.messages = []
			}
			user.messages.push(messageItem)
			await db.collection<DBUser>('Users').replaceOne({_id: user._id}, user)
		}
		await db.collection<LogItem>('EventLog').insertOne({
			timestamp: new Date().getTime(),
			type: LogType.Admin,
			uid: await getAdmin(req),
			content: 'Sent message to all'
		})
		return {body: "success"}
	} else {
		const filter = {_id: `${gid}/${uid}`}
		const user = await db.collection<DBUser>('Users').findOne(
			filter
		)
		if (user == null) {
			return {status: 404, body: {error: 'User Not Found'}}
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
		await db.collection<LogItem>('EventLog').insertOne({
			timestamp: new Date().getTime(),
			type: LogType.Admin,
			uid: await getAdmin(req),
			content: 'Sent message to ' + uid
		})
		await db.collection<DBUser>('Users').replaceOne(filter, user)

		delete user.group
		delete user.chats
		delete user.pin
		delete user.content
		return {body: user as undefined}
	}
}