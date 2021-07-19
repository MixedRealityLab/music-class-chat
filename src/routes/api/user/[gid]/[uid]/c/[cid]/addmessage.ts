import {getDb} from "$lib/db";
import {isEnabled} from '$lib/logic'
import type {AddUserMessageRequest, DBUser, LogItem, UserChat} from "$lib/types";
import {LogType} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function post({params, body}: Request): Promise<EndpointOutput> {
	const {gid, uid, cid} = params
	if (!gid || !uid || !cid) {
		return {status: 400, body: {error: 'Bad Request'}}
	}
	const addRequest = body as unknown as AddUserMessageRequest
	if (!addRequest || !addRequest.message) {
		console.log(`bad add message request`, addRequest)
		return {status: 400, body: {error: 'Bad Request'}}
	}

	const db = await getDb()
	const dbUserChat = await db.collection<UserChat>('UserChats').findOne(
		{_id: `${gid}/${cid}/${uid}`}
	)
	//console.log(`get user chat ${sid}/${gid}/${cid}/${uid}`, dbuc)
	if (!dbUserChat) {
		return {status: 404, body: {error: 'Not Found'}}
	}
	const messages = [...dbUserChat.messages, addRequest.message]
	await db.collection<UserChat>('UserChats').updateOne(
		{_id: `${gid}/${cid}/${uid}`},
		{$set: {messages: messages, nextix: addRequest.nextix}})
	// user
	const dbUser = await db.collection<DBUser>('Users').findOne(
		{_id: `${gid}/${uid}`}
	)
	//console.log(`get user ${sid}/${gid}/${uid}`, dbuser)
	if (!dbUser) {
		return {status: 404, body: {error: 'Not Found'}}
	}
	// rewards
	if (!addRequest.rewards) addRequest.rewards = []
	if (!addRequest.reset) addRequest.reset = []

	const rewards = dbUser.rewards.map((r) => ({
		_id: r._id,
		icon: r.icon,
		noicon: r.noicon,
		got: ((addRequest.rewards.indexOf(r._id) >= 0) || (r.got && addRequest.reset.indexOf(r._id) < 0)),
	}))
	// enable
	const ucs = [...dbUser.chats]
	for (const uc of ucs) {
		uc.enabled = isEnabled(rewards, uc.chatdef.ifall, uc.chatdef.andnot)
	}
	let content = dbUser.content
	if (addRequest.message.content && !addRequest.message.content.hidden) {
		content = [...dbUser.content, addRequest.message.content]
		content.sort((a, b) => (a.sortorder ? a.sortorder : 0) - (b.sortorder ? b.sortorder : 0))
	}

	await db.collection<DBUser>('Users').updateOne(
		{_id: `${gid}/${uid}`},
		{$set: {rewards: rewards, chats: ucs, content: content}})
	if (addRequest.rewards.length == 0) {
		await db.collection<LogItem>('EventLog').insertOne({
			timestamp: new Date().getTime(), type: LogType.Chat, uid: dbUser._id
		})
	} else {
		await db.collection<LogItem>('EventLog').insertOne({
			timestamp: new Date().getTime(),
			type: LogType.Reward,
			uid: dbUser._id,
			content: addRequest.rewards.join(', ')
		})
	}

	return {body: {}}
}
