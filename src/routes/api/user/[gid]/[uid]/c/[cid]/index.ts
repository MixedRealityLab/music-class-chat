import type {Response} from 'express';
import type {ServerRequest} from '../../../../../../../_servertypes'
import type {ChatDef, UserChat} from "../../../../../../../_types";

export async function get(req: ServerRequest, res: Response) {
	try {
		const {gid, uid, cid} = req.params;
		if (!gid || !uid || !cid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		let dbuc = await req.app.locals.db.collection<UserChat>('UserChats').findOne(
			{_id: `${gid}/${cid}/${uid}`}
		)
		//console.log(`get user chat ${sid}/${gid}/${cid}/${uid}`, dbuc);
		if (!dbuc) {
			res.status(404).json({error: 'Not Found'})
			return
		}
		// full chatdef with messages
		dbuc.chatdef = await req.app.locals.db.collection<ChatDef>('ChatDefs').findOne({_id: `${gid}/${cid}`})
		//console.log(`get chatdef ${sid}/${gid}/${cid}`, dbuc);
		if (!dbuc.chatdef) {
			res.status(500).json({error: `Missing chatdef ${gid}/${cid}`})
			return
		}
		res.setHeader('Content-Type', 'application/json');
		res.json(dbuc)
	} catch (error) {
		console.log('Error (get (user) userchat)', error);
		res.writeHead(500).end(JSON.stringify({error: error}));
	}
}
