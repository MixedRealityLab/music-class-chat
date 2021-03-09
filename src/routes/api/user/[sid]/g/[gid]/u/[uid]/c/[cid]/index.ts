import type { SapperResponse } from '@sapper/server';
import type * as t from '../../../../../../../../../../_types';
import type { ServerRequest } from '../../../../../../../../../../_servertypes'

export async function get(req: ServerRequest, res: SapperResponse, next: () => void) {
  try {
    const { sid, gid, uid, cid } = req.params;
    if (!sid || !gid || !uid || !cid) {
      res.writeHead(400).end(JSON.stringify({error:'Bad Request'}));
      return;
    }

    let dbuc = await req.app.locals.db.collection('UserChats').findOne(
	{ _id: `${sid}/${gid}/${cid}/${uid}` }
    ) as t.UserChat;
    //console.log(`get user chat ${sid}/${gid}/${cid}/${uid}`, dbuc);
    if (!dbuc) {
      res.writeHead(404).end(JSON.stringify({error:'Not Found'}));
      return;
    }
    // full chatdef with messages
    dbuc.chatdef = await req.app.locals.db.collection('ChatDefs').findOne(
        { _id: `${sid}/${gid}/${cid}` }
    ) as t.ChatDef;
    //console.log(`get chatdef ${sid}/${gid}/${cid}`, dbuc);
    if (!dbuc.chatdef) {
      res.writeHead(500).end(JSON.stringify({error:`Missing chatdef ${sid}/${gid}/${cid}`}));
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(dbuc));
  } catch (error) {
    console.log('Error (get (user) userchat)', error);
    res.writeHead(500).end(JSON.stringify({error:error}));
  }
}
