import type {Response} from "express"
import type {ServerRequest} from "../../_servertypes"
import type {AdminSession, DBAdmin} from "../../_types"

export async function get(req: ServerRequest, res: Response) {
	try {
		const {key} = req.query
		if (!key) {
			// TODO Pass error messages
			res.redirect(req.baseUrl + '/admin/login')
			return
		}

		const session: AdminSession = await req.app.locals.db.collection('AdminSessions').findOne({password: key})
		if (session == null) {
			res.redirect(req.baseUrl + '/admin/login')
			return
		}
		const admin = await req.app.locals.db.collection<DBAdmin>('Admins').findOne({
			_id: session.email,
			enabled: true
		})
		if (!admin) {
			res.redirect(req.baseUrl + '/admin/login')
			return
		}

		const expires = addDays(new Date(), 14)
		session.expires = expires.toISOString()
		session.password = null
		await req.app.locals.db.collection<AdminSession>('AdminSessions').replaceOne({id: session.id}, session)

		req.session.sessionid = session.id
		req.session.cookie.expires = expires

		console.log("success!")

		res.redirect(req.baseUrl + '/admin')
	} catch (error) {
		console.log('Error (update group)', error)
		res.status(500).json({error: error})
	}
}

function addDays(current: Date, days: number): Date {
	let result = new Date(current)
	result.setDate(result.getDate() + days)
	return result
}