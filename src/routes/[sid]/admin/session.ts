import type {Response} from "express"
import type {ServerRequest} from "../../../_servertypes"
import type {AdminSession, DBAdmin, DBSite} from "../../../_types"

export async function get(req: ServerRequest, res: Response) {
	try {
		const {sid} = req.params
		const {key} = req.query
		if (!sid || !key) {
			// TODO Pass error messages
			res.redirect(`/${sid}/admin/login`)
			return
		}

		const site: DBSite = await req.app.locals.db.collection('Sites').findOne({_id: sid})
		const session: AdminSession = await req.app.locals.db.collection('AdminSessions').findOne({password: key})

		if (session == null) {
			res.redirect(`/${sid}/admin/login`)
			return
		}
		const admin = site.admins.find((admin: DBAdmin) => admin.enabled && admin.email === session.email)
		if (!admin) {
			res.redirect(`/${sid}/admin/login`)
			return
		}

		const expires = addDays(new Date(), 14)
		session.expires = expires.toISOString()
		session.password = null
		await req.app.locals.db.collection<AdminSession>('AdminSessions').replaceOne({id: session.id}, session)

		req.session.sessionid = session.id
		req.session.cookie.expires = expires

		console.log("success!")

		res.redirect(`/${sid}/admin`)
	} catch (error) {
		console.log('Error (update group)', error);
		res.writeHead(500).end(JSON.stringify({error: error}));
	}
}

function addDays(date, days) {
	let result = new Date(date)
	result.setDate(result.getDate() + days)
	return result;
}