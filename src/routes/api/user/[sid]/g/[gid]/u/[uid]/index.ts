import type { SapperResponse } from '@sapper/server';
import type * as t from '../../../../../../../../_types';
import type { ServerRequest } from '../../../../../../../../_servertypes'

export async function get(req: ServerRequest, res: SapperResponse, next: () => void) {
  try {
    const { sid, gid, uid } = req.params;
    if (!sid || !gid || !uid) {
      res.writeHead(400).end(JSON.stringify({error:'Bad Request'}));
      return;
    }

    const dbuser = await req.app.locals.db.collection('Users').findOne(
	{ _id: `${sid}/${gid}/${uid}` }
    ) as t.DBUser;
    console.log(`get user ${sid}/${gid}/${uid}`, dbuser);
    if (!dbuser) {
      res.writeHead(404).end(JSON.stringify({error:'Not Found'}));
      return;
    }
    const uuser: t.UUser = {
      _id: dbuser._id, 
      usercode: dbuser.usercode,
      groupid: dbuser.groupid,
      group: dbuser.group,
      rewards: dbuser.rewards,
      chats: dbuser.chats,
      content: dbuser.content,
      created: dbuser.created,
    };
    //console.log('group', ugrop);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(uuser));
  } catch (error) {
    console.log('Error (get (user) user)', error);
    res.writeHead(500).end(JSON.stringify({error:error}));
  }
}
