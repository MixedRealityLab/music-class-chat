import {getDb} from "$lib/db";
import {isValidAdminSession} from "$lib/session";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const {gid, uid} = req.params
	if (!gid || !uid) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const db = await getDb()
	const user = await db.collection('Users').findOne(
		{_id: `${gid}/${uid}`}
	)
	delete user.group
	delete user.chats
	delete user.pin
	delete user.content
	return {body: user}
}