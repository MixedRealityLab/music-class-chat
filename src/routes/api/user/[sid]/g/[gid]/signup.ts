import type {SapperResponse} from '@sapper/server';
import * as crypto from 'crypto';
import type {Db} from 'mongodb';
import {isEnabled} from '../../../../../../_logic';
import type {ServerRequest} from '../../../../../../_servertypes';
import type {ChatDef, DBGroup, DBUser, SignupRequest, SignupResponse, UserChat} from "../../../../../../_types";

export async function post(req: ServerRequest, res: SapperResponse) {
	try {
		const {sid, gid} = req.params;
		if (!sid || !gid) {
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request'}));
			return;
		}
		// SignupRequest -> SignupResponse
		const signup = req.body as SignupRequest;

		const dbgroup = await req.app.locals.db.collection('Groups').findOne(
			{_id: `${sid}/${gid}`}
		) as DBGroup
		//console.log(`get group ${sid}/${gid}`, dbgroup);
		if (!dbgroup) {
			res.writeHead(404).end(JSON.stringify({error: 'Not Found'}));
			return;
		}
		if ((signup.anon && !dbgroup.allowguest) || (!signup.anon && dbgroup.password != signup.password)) {
			console.log(`unauthorized signup, anon=${signup.anon} vs ${dbgroup.allowguest} and password=${signup.password} vs ${dbgroup.password}`);
			res.writeHead(401).end(JSON.stringify({error: 'Unauthorized'}));
			return;
		}
		if ((dbgroup.requireinitials && !signup.initials) ||
			(dbgroup.requireemail && (!signup.email || signup.email.split('@').length != 2)) ||
			(dbgroup.requirepin && !signup.pin)) {
			res.writeHead(400).end(JSON.stringify({error: 'Bad Request (initials, email or pin)'}));
			return;
		}
		const user: DBUser = await createNewUser(dbgroup, signup, req.app.locals.db);
		console.log(`new user ${user._id}`);
		const response: SignupResponse = {
			usercode: user.usercode,
		};
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(response));
	} catch (error) {
		console.log('Error (signup)', error);
		res.writeHead(500).end(JSON.stringify({error: error}));
	}
}

async function createNewUser(group: DBGroup, signup: SignupRequest,
                             db: Db): Promise<DBUser> {
	const uid: string = crypto.randomBytes(12).toString('hex');
	//console.log(`new user id: ${_id}`);
	const now = new Date().toISOString();
	let user: DBUser = {
		_id: `${group._id}/${uid}`,
		usercode: uid,
		groupid: group._id,
		group: {
			id: group.id,
			_id: group._id,
			name: group.name,
			description: group.description,
			site: {
				_id: group.sid,
				logo: ''
				// CSS, etc?
			},
		},
		rewards: group.rewards.map((r) => ({_id: r._id, icon: r.icon, noicon: r.noicon, got: false})),
		chats: [],
		content: [],
		created: new Date().toISOString(),
		initials: signup.initials,
		pin: signup.pin,
		lastmodified: now,
	};
	// chats
	const cds = await db.collection('ChatDefs').find({groupid: group._id}).toArray() as ChatDef[];
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
		});
		// add UserChat
		await db.collection('UserChats').insertOne(uc);
	}
	// add
	await db.collection('Users').insertOne(user);
	return user;
}