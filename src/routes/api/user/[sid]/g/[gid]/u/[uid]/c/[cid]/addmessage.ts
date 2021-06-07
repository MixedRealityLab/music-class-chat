import type {SapperResponse} from '@sapper/server'
import {isEnabled} from '../../../../../../../../../../_logic'
import type {ServerRequest} from '../../../../../../../../../../_servertypes'
import type {AddUserMessageRequest, DBUser, LogItem, UserChat} from "../../../../../../../../../../_types";
import {LogType} from "../../../../../../../../../../_types";

export async function post(req: ServerRequest, res: SapperResponse) {
	try {
		const {sid, gid, uid, cid} = req.params
		if (!sid || !gid || !uid || !cid) {
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}))
			return
		}
		const addRequest = req.body as AddUserMessageRequest
		if (!addRequest || !addRequest.message) {
			console.log(`bad add message request`, addRequest)
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}))
			return
		}

		let dbUserChat = await req.app.locals.db.collection<UserChat>('UserChats').findOne(
			{_id: `${sid}/${gid}/${cid}/${uid}`}
		)
		//console.log(`get user chat ${sid}/${gid}/${cid}/${uid}`, dbuc)
		if (!dbUserChat) {
			res.writeHead(404).end(JSON.stringify({error: 'Not Found'}))
			return
		}
		let messages = [...dbUserChat.messages, addRequest.message]
		await req.app.locals.db.collection<UserChat>('UserChats').updateOne(
			{_id: `${sid}/${gid}/${cid}/${uid}`},
			{$set: {messages: messages, nextix: addRequest.nextix}})
		// user
		let dbUser = await req.app.locals.db.collection<DBUser>('Users').findOne(
			{_id: `${sid}/${gid}/${uid}`}
		)
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

		await req.app.locals.db.collection<DBUser>('Users').updateOne(
			{_id: `${sid}/${gid}/${uid}`},
			{$set: {rewards: rewards, chats: ucs, content: content}})
		if(addRequest.rewards.length == 0) {
			await req.app.locals.db.collection<LogItem>('EventLog').insertOne({
				timestamp: new Date().getTime(), type: LogType.Chat, uid: dbUser._id
			})
		} else {
			await req.app.locals.db.collection<LogItem>('EventLog').insertOne({
				timestamp: new Date().getTime(), type: LogType.Reward, uid: dbUser._id, content: addRequest.rewards.join(', ')
			})
		}

		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify({}))
	} catch (error) {
		console.log('Error (add (user) message)', error)
		res.writeHead(500).end(JSON.stringify({error: error}))
	}
}
