import {getDb} from "$lib/db";
import type {ChatDef, UserChat} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const {gid, uid, cid} = req.params;
	if (!gid || !uid || !cid) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	const db = await getDb()
	const dbuc = await db.collection<UserChat>('UserChats').findOne(
		{_id: `${gid}/${cid}/${uid}`}
	)
	//console.log(`get user chat ${sid}/${gid}/${cid}/${uid}`, dbuc);
	if (!dbuc) {
		return {status: 404, body: {error: 'Not Found'}}
	}
	// full chatdef with messages
	dbuc.chatdef = await db.collection<ChatDef>('ChatDefs').findOne({_id: `${gid}/${cid}`})
	//console.log(`get chatdef ${sid}/${gid}/${cid}`, dbuc);
	if (!dbuc.chatdef) {
		return {status: 500, body: {error: `Missing chatdef ${gid}/${cid}`}}
	}
	return {body: dbuc}
}
