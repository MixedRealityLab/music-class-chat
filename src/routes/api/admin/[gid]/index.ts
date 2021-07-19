import {getDb} from "$lib/db";
import {isValidAdminSession} from "$lib/session";
import type {AFile, DBGroup, DBUser} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params
	if (!gid) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}
	const db = await getDb()
	const group = await db.collection<DBGroup>('Groups').findOne({_id: gid})
	if (group == null) {
		return {status: 404, body: {error: 'Group Doesn\'t Exist'}}
	}

	const users = await db.collection<DBUser>('Users').find({groupid: gid}).toArray()
	users.forEach(user => {
		delete user.group
		delete user.groupid
		delete user.rewards
		delete user.chats
		delete user.pin
		delete user.content
	})
	const files = await db.collection<AFile>('Files').find().toArray()
	return {body: {users: users, files: files}}
}