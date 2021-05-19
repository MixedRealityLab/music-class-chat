import type {Response} from 'express'
import type {ServerRequest} from '../../../../_servertypes'
import type {DBSite, USite} from "../../../../_types";

export async function get(req: ServerRequest, res: Response) {
	try {
		const {sid} = req.params;
		if (!sid) {
			res
				.status(400)
				.json({error: 'Bad Request'})
			return;
		}

		const dbsite = await req.app.locals.db.collection('Sites').findOne({_id: sid}) as DBSite
		const usite: USite = {
			_id: sid
		}
		res.json(usite)
	} catch (error) {
		console.log('Error (get (user) group)', error)
		res.status(500).json({error: error})
	}
}
