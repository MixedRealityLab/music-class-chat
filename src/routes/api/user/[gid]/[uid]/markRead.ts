import {getDb} from "$lib/db";
import type {DBUser} from "$lib/types"
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";

export async function post(req: Request): Promise<EndpointOutput> {
	const {gid, uid} = req.params
	const body = req.body as ReadOnlyFormData
	const timestamp = Date.parse(body.get('timestamp'))
	if (!gid || !uid || !timestamp) {
		return {
			status: 400,
			body: {error: 'Bad Request'}
		}
	}

	const filter = {_id: `${gid}/${uid}`}
	const db = await getDb()
	const dbUser = await db.collection<DBUser>('Users').findOne(filter)
	dbUser.messages.forEach((message) => {
		const messageTimestamp = Date.parse(message.timestamp)
		if (messageTimestamp <= timestamp) {
			message.read = true
		}
	})
	await db.collection<DBUser>('Users').replaceOne(filter, dbUser)
	//console.log('group', ugrop)
	return {body: dbUser.messages as undefined}
}
