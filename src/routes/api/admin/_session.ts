import type {ServerRequest} from "../../../_servertypes";
import type {AdminSession, DBSite} from "../../../_types";

export async function isValidAdminSession(req: ServerRequest): Promise<boolean> {
	const {sid} = req.params
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

	console.log(`using admin session for ${session.email}`);
	const dbSite = await req.app.locals.db.collection<DBSite>('Sites').findOne({_id: sid})
	if (!dbSite) {
		return false
	}
	const admin = dbSite.admins.find((a) => a.email == session.email);
	if (!admin) {
		console.log(`admin ${session.email} not found on site ${sid}`);
		return false
	}
	if (!admin.enabled) {
		console.log(`admin ${session.email} disabled on site ${sid}`);
		return false
	}

	return true
}