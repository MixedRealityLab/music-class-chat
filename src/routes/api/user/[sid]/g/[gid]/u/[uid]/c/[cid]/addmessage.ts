import type {SapperResponse} from '@sapper/server'
import {isEnabled} from '../../../../../../../../../../_logic'
import type {ServerRequest} from '../../../../../../../../../../_servertypes'
import type * as t from '../../../../../../../../../../_types'

export async function post(req: ServerRequest, res: SapperResponse) {
	try {
		const {sid, gid, uid, cid} = req.params
		if (!sid || !gid || !uid || !cid) {
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}))
			return
		}
		const addRequest = req.body as t.AddUserMessageRequest
		if (!addRequest || !addRequest.message) {
			console.log(`bad add message request`, addRequest)
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}))
			return
		}

		let dbUserChat = await req.app.locals.db.collection('UserChats').findOne(
			{_id: `${sid}/${gid}/${cid}/${uid}`}
		) as t.UserChat
		//console.log(`get user chat ${sid}/${gid}/${cid}/${uid}`, dbuc)
		if (!dbUserChat) {
			res.writeHead(404).end(JSON.stringify({error: 'Not Found'}))
			return
		}
		let messages = [...dbUserChat.messages, addRequest.message]
		await req.app.locals.db.collection('UserChats').updateOne(
			{_id: `${sid}/${gid}/${cid}/${uid}`},
			{$set: {messages: messages, nextix: addRequest.nextix}})
		// user
		let dbUser = await req.app.locals.db.collection('Users').findOne(
			{_id: `${sid}/${gid}/${uid}`}
		) as t.DBUser
		//console.log(`get user ${sid}/${gid}/${uid}`, dbuser)
		if (!dbUser) {
			res.writeHead(404).end(JSON.stringify({error: 'Not Found'}))
			return
		}
		// rewards
		if (!addRequest.rewards) addRequest.rewards = []
		if (!addRequest.reset) addRequest.reset = []

		let rewards = dbUser.rewards.map((r) => ({
			_id: r._id,
			icon: r.icon,
			noicon: r.noicon,
			got: ((addRequest.rewards.indexOf(r._id) >= 0) || (r.got && addRequest.reset.indexOf(r._id) < 0)),
		}))
		// enable
		let ucs = [...dbUser.chats]
		for (let uc of ucs) {
			uc.enabled = isEnabled(rewards, uc.chatdef.ifall, uc.chatdef.andnot)
		}
		let content = dbUser.content
		if (addRequest.message.content && !addRequest.message.content.hidden) {
			content = [...dbUser.content, addRequest.message.content]
			content.sort((a, b) => (a.sortorder ? a.sortorder : 0) - (b.sortorder ? b.sortorder : 0))
		}

		await req.app.locals.db.collection('Users').updateOne(
			{_id: `${sid}/${gid}/${uid}`},
			{$set: {rewards: rewards, chats: ucs, content: content}})

		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({}))
	} catch (error) {
		console.log('Error (add (user) message)', error)
		res.writeHead(500).end(JSON.stringify({error: error}))
	}
}
