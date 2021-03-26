import type {Response} from 'express'
import type {ServerRequest} from "../../../../_servertypes";
import type {DBGroup} from "../../../../_types";
import {isValidAdminSession} from "../_session";

export async function get(req: ServerRequest, res: Response) {
	try {
		const {sid} = req.params
		if (!sid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
			return
		}

		const groups = await req.app.locals.db.collection<DBGroup>('Groups').find({sid: sid}).toArray()
		res.json({groups});
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}