import {getDb} from "$lib/db";
import type {AdminSession, DBAdmin} from "$lib/types";
import type {Request} from "@sveltejs/kit";

export async function isValidAdminSession(req: Request): Promise<boolean> {
	const sessionId = req.locals.session
	if (!sessionId) {
		console.log(`session id ${sessionId}`)
		return false
	}

	const db = await getDb()
	const session = await db.collection<AdminSession>('AdminSessions').findOne({id: sessionId});
	if (!session) {
		console.log(`no admin session found: ${sessionId}`)
		return false
	}

	const now = new Date();
	const expires = new Date(session.expires);
	if (expires.getTime() < now.getTime()) {
		console.log(`admin session ${sessionId} expires (${expires} vs ${now})`)
		await db.collection<AdminSession>('AdminSessions').deleteOne({id: sessionId})
		return false
	}

	if (session.password != null) {
		return false
	}

	const dbAdmin = await db.collection<DBAdmin>('Admins').findOne({_id: session.email})
	if (!dbAdmin) {
		console.log(`admin ${session.email} not found`);
		return false
	}
	if (!dbAdmin.enabled) {
		console.log(`admin ${session.email} disabled`);
		return false
	}

	return true
}