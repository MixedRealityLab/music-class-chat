import {getDb} from "$lib/db";
import type {DBGroup, UGroup} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params;
	if (!gid) {
		return {
			status: 400,
			body: {error: 'Bad Request'}
		}
	}

	const db = await getDb()
	const group: DBGroup = await db.collection<DBGroup>('Groups').findOne(
		{_id: `${gid}`}
	)
	//console.log(`get group ${sid}/${gid}`, dbgroup);
	if (!group) {
		return {
			status: 404,
			body: {error: 'Not Found'}
		};
	}
	const uGroup: UGroup = {
		_id: group._id,
		name: group.name,
		description: group.description,
		showpublic: group.showpublic,
		requireinitials: group.requireinitials,
		requirepin: group.requirepin,
		requireemail: group.requireemail,
		allowselfenrol: group.allowselfenrol,
		allowguest: group.allowguest,
	}
	return {body: uGroup}
}
