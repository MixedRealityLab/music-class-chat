import {getDb} from "$lib/db";
import {isEnabled} from '$lib/logic'
import type {ChatDef, DBGroup, DBUser, LogItem, SignupRequest, UserChat} from "$lib/types"
import {idAlphabet, LogType} from "$lib/types"
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {Db} from 'mongodb'
import {customAlphabet} from "nanoid"

export async function post(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params
	if (!gid) {
		return {
			status: 400,
			body: {error: 'Bad Request'}
		}
	}
	// SignupRequest -> SignupResponse
	const signup = req.body as unknown as SignupRequest

	const db = await getDb()
	const dbGroup = await db.collection<DBGroup>('Groups').findOne({_id: gid})
	//console.log(`get group ${sid}/${gid}`, dbgroup)
	if (!dbGroup) {
		return {
			status: 404,
			body: {error: 'Not Found'}
		}
	}
	if ((signup.anon && !dbGroup.allowguest) || (!signup.anon && dbGroup.password != signup.password)) {
		console.log(`unauthorized signup, anon=${signup.anon} vs ${dbGroup.allowguest} and password=${signup.password} vs ${dbGroup.password}`)
		return {
			status: 401, body: {error: 'Unauthorized'}
		}
	}
	if ((dbGroup.requireinitials && !signup.initials) ||
		(dbGroup.requireemail && (!signup.email || signup.email.split('@').length != 2)) ||
		(dbGroup.requirepin && !signup.pin)) {
		return {status: 400, body: {error: 'Bad Request (initials, email or pin)'}}
	}
	const user = await createNewUser(dbGroup, signup, db)
	console.log(`new user ${user._id}`)
	return {
		body: {
			usercode: user.usercode,
		}
	}
}

async function createNewUser(group: DBGroup, signup: SignupRequest, db: Db): Promise<DBUser> {

	const uid: string = customAlphabet(idAlphabet, 10)()
	//console.log(`new user id: ${_id}`)
	const now = new Date().toISOString()
	const user: DBUser = {
		_id: `${group._id}/${uid}`,
		usercode: uid,
		groupid: group._id,
		group: {
			_id: group._id,
			name: group.name,
			description: group.description,
		},
		rewards: group.rewards.map((r) => ({_id: r._id, icon: r.icon, noicon: r.noicon, got: false})),
		chats: [],
		content: [],
		created: new Date().toISOString(),
		initials: signup.initials,
		pin: signup.pin,
		messages: [],
		lastmodified: now,
	}
	// chats
	const cds = await db.collection<ChatDef>('ChatDefs').find({groupid: group._id}).toArray()
	for (const cd of cds) {
		const uc: UserChat = {
			_id: `${cd._id}/${user.usercode}`,
			chatdef: {
				id: cd.id,
				_id: cd._id,
				groupid: cd.groupid,
				ifall: cd.ifall,
				andnot: cd.andnot,
				sortorder: cd.sortorder,
				name: cd.name,
				description: cd.description,
				icon: cd.icon,
				primaryColour: cd.primaryColour,
				secondaryColour: cd.secondaryColour
			},
			enabled: isEnabled(user.rewards, cd.ifall, cd.andnot),
			unread: false,
			waiting: false,
			messages: [],
			nextix: 0,
		}
		user.chats.push({
			_id: uc._id,
			chatdef: uc.chatdef,
			enabled: uc.enabled,
			unread: uc.unread,
			waiting: uc.waiting,
			nextix: uc.nextix,
		})
		// add UserChat
		await db.collection<UserChat>('UserChats').insertOne(uc)
	}
	// add
	await db.collection<DBUser>('Users').insertOne(user)
	await db.collection<LogItem>('EventLog').insertOne({
		timestamp: new Date().getTime(), type: LogType.SignUp, uid: user._id
	})
	return user
}