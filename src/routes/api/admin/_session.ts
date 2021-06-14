import type {ServerRequest} from "../../../_servertypes";
import type {AdminSession, DBAdmin} from "../../../_types";

export async function isValidAdminSession(req: ServerRequest): Promise<boolean> {
	const {sessionid} = req.session
	if (!sessionid) {
		console.log(`session id ${sessionid}`)
		return false
	}

	const session = await req.app.locals.db.collection<AdminSession>('AdminSessions').findOne({id: sessionid});
	if (!session) {
		console.log(`no admin session found: ${sessionid}`)
		return false
	}

	const now = new Date();
	const expires = new Date(session.expires);
	if (expires.getTime() < now.getTime()) {
		console.log(`admin session ${sessionid} expires (${expires} vs ${now})`)
		await req.app.locals.db.collection<AdminSession>('AdminSessions').deleteOne({id: sessionid})
		return false
	}

	if (session.password != null) {
		return false
	}

	const dbAdmin = await req.app.locals.db.collection<DBAdmin>('Admins').findOne({_id: session.email})
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