import {getDb} from "$lib/db";
import {isValidAdminSession} from "$lib/session";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const db = await getDb()
	return {body: await db.collection('Groups').find().toArray()}
}