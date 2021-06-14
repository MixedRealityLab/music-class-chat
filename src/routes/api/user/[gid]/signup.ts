import type {Response} from "express"
import type {Db} from 'mongodb'
import {customAlphabet} from "nanoid"
import {isEnabled} from '../../../../_logic'
import type {ServerRequest} from '../../../../_servertypes'
import type {ChatDef, DBGroup, DBUser, LogItem, SignupRequest, SignupResponse, UserChat} from "../../../../_types"
import {idAlphabet, LogType} from "../../../../_types"

export async function post(req: ServerRequest, res: Response) {
	try {
		const {gid} = req.params
		if (!gid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}
		// SignupRequest -> SignupResponse
		const signup = req.body as SignupRequest

		const dbGroup = await req.app.locals.db.collection<DBGroup>('Groups').findOne({_id: gid})
		//console.log(`get group ${sid}/${gid}`, dbgroup)
		if (!dbGroup) {
			res.status(404).json({error: 'Not Found'})
			return
		}
		if ((signup.anon && !dbGroup.allowguest) || (!signup.anon && dbGroup.password != signup.password)) {
			console.log(`unauthorized signup, anon=${signup.anon} vs ${dbGroup.allowguest} and password=${signup.password} vs ${dbGroup.password}`)
			res.status(401).json({error: 'Unauthorized'})
			return
		}
		if ((dbGroup.requireinitials && !signup.initials) ||
			(dbGroup.requireemail && (!signup.email || signup.email.split('@').length != 2)) ||
			(dbGroup.requirepin && !signup.pin)) {
			res.status(400).json({error: 'Bad Request (initials, email or pin)'})
			return
		}
		const user = await createNewUser(dbGroup, signup, req.app.locals.db)
		console.log(`new user ${user._id}`)
		const response: SignupResponse = {
			usercode: user.usercode,
		}
		res.setHeader('Content-Type', 'application/json')
		res.json(response)
	} catch (error) {
		console.log('Error (signup)', error)
		res.writeHead(500).end(JSON.stringify({error: error}))
	}
}

async function createNewUser(group: DBGroup, signup: SignupRequest, db: Db): Promise<DBUser> {

	const uid: string = customAlphabet(idAlphabet, 10)()
	//console.log(`new user id: ${_id}`)
	const now = new Date().toISOString()
	let user: DBUser = {
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
	for (let cd of cds) {
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