import type {SapperResponse} from '@sapper/server'
import type {ServerRequest} from '../../../../../_servertypes'
import type {DBUser} from "../../../../../_types"

export async function post(req: ServerRequest, res: SapperResponse) {
	try {
		const {gid, uid} = req.params
		const timestamp = Date.parse(req.body.timestamp)
		if (!gid || !uid || !timestamp) {
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}))
			return
		}

		const filter = {_id: `${gid}/${uid}`}
		console.log(timestamp)
		const dbUser = await req.app.locals.db.collection('Users').findOne(filter) as DBUser
		dbUser.messages.forEach((message) => {
			const messageTimestamp = Date.parse(message.timestamp)
			console.log(message.text)
			console.log(messageTimestamp)
			if (messageTimestamp <= timestamp) {
				message.read = true
			}
		})
		await req.app.locals.db.collection('Users').replaceOne(filter, dbUser)
		//console.log('group', ugrop)
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify(dbUser.messages))
	} catch (error) {
		console.log('Error (get (user) user)', error)
		res.writeHead(500).end(JSON.stringify({error: error}))
	}
}
