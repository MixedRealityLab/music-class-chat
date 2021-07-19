import {base} from '$app/paths'
import {getDb} from "$lib/db";
import type {AdminSession, DBAdmin} from "$lib/types"
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	try {
		const key = req.query.get('key')
		if (!key) {
			// TODO Pass error messages
			return {
				status: 302, headers: {Location: base + '/admin/login'}
			}
		}

		const db = await getDb()
		const session: AdminSession = await db.collection('AdminSessions').findOne({password: key})
		if (session == null) {
			return {
				status: 302, headers: {Location: base + '/admin/login'}
			}
		}
		const admin = await db.collection<DBAdmin>('Admins').findOne({
			_id: session.email,
			enabled: true
		})
		if (!admin) {
			return {
				status: 302, headers: {Location: base + '/admin/login'}
			}
		}

		const expires = addDays(new Date(), 14)
		session.expires = expires.toISOString()
		session.password = null
		await db.collection<AdminSession>('AdminSessions').replaceOne({id: session.id}, session)

		req.locals.session = session.id

		console.log("success!")

		return {
			status: 302, headers: {Location: base + '/admin'}
		}
	} catch
		(error) {
		console.log('Error (update group)', error)
		return {status: 500, body: {error: error}}
	}
}

function addDays(current: Date, days: number): Date {
	const result = new Date(current)
	result.setDate(result.getDate() + days)
	return result
}