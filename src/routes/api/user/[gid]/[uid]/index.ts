import type {SapperResponse} from '@sapper/server'
import type {ServerRequest} from '../../../../../_servertypes'
import type {DBUser, UUser} from "../../../../../_types"

export async function get(req: ServerRequest, res: SapperResponse) {
	try {
		const {gid, uid} = req.params
		if (!gid || !uid) {
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}))
			return
		}

		const dbUser = await req.app.locals.db.collection('Users').findOne(
			{_id: `${gid}/${uid}`}
		) as DBUser
		//console.log(`get user ${sid}/${gid}/${uid}`, dbuser)
		if (!dbUser) {
			res.writeHead(404).end(JSON.stringify({error: 'Not Found'}))
			return
		}
		const user: UUser = {
			_id: dbUser._id,
			usercode: dbUser.usercode,
			groupid: dbUser.groupid,
			group: dbUser.group,
			rewards: dbUser.rewards,
			chats: dbUser.chats,
			content: dbUser.content,
			created: dbUser.created,
			messages: dbUser.messages,
		}
		//console.log('group', ugrop)
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify(user))
	} catch (error) {
		console.log('Error (get (user) user)', error)
		res.writeHead(500).end(JSON.stringify({error: error}))
	}
}
