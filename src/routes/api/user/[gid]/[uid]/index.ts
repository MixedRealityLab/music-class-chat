import {getDb} from "$lib/db";
import type {DBUser, UUser} from "$lib/types"
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const {gid, uid} = req.params
	if (!gid || !uid) {
		return {
			status: 400,
			body: {error: 'Bad Request'}
		}
	}

	const db = await getDb()
	const dbUser = await db.collection<DBUser>('Users').findOne(
		{_id: `${gid}/${uid}`}
	)
	//console.log(`get user ${sid}/${gid}/${uid}`, dbuser)
	if (!dbUser) {
		return {
			status: 404,
			body: {error: 'Not Found'}
		}
	}
	const user: UUser = {
		_id: dbUser._id,
		usercode: dbUser.usercode,
		groupid: dbUser.groupid,
		group: dbUser.group,
		rewards: dbUser.rewards,
		chats: dbUser.chats,
		content: dbUser.content,
		created: dbUser.created,
		messages: dbUser.messages,
	}
	return {body: user}
}
