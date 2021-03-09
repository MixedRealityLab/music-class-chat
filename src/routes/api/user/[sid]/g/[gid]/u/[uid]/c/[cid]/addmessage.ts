import type { SapperResponse } from '@sapper/server';
import type * as t from '../../../../../../../../../../_types';
import type { ServerRequest } from '../../../../../../../../../../_servertypes'
import { isEnabled } from '../../../../../../../../../../_logic';

export async function post(req: ServerRequest, res: SapperResponse, next: () => void) {
  try {
    const { sid, gid, uid, cid } = req.params;
    if (!sid || !gid || !uid || !cid) {
      res.writeHead(400).end(JSON.stringify({error:'Bad Request'}));
      return;
    }
    const addreq = req.body as t.AddUserMessageRequest;
    if (!addreq || !addreq.message) {
      console.log(`bad add message request`, addreq);
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
    let messages = [...dbuc.messages, addreq.message];
    await req.app.locals.db.collection('UserChats').updateOne(
	    { _id: `${sid}/${gid}/${cid}/${uid}` }, 
	    { $set: { messages: messages, nextix: addreq.nextix }});
    // user
    let dbuser = await req.app.locals.db.collection('Users').findOne(
        { _id: `${sid}/${gid}/${uid}` }
    ) as t.DBUser;
    //console.log(`get user ${sid}/${gid}/${uid}`, dbuser);
    if (!dbuser) {
      res.writeHead(404).end(JSON.stringify({error:'Not Found'}));
      return;
    }
    // rewards
    if (!addreq.rewards) addreq.rewards = [];
    if (!addreq.reset) addreq.reset = [];

    let rewards = dbuser.rewards.map((r) => ({
	    _id:r._id, 
	    icon: r.icon, 
	    noicon: r.noicon, 
	    got: ((addreq.rewards.indexOf(r._id)>=0) || (r.got && addreq.reset.indexOf(r._id)<0)),
	}));
    // enable
    let ucs = [...dbuser.chats];
    for (let uc of ucs) {
      uc.enabled = isEnabled(rewards, uc.chatdef.ifall, uc.chatdef.andnot);
    }
    let content = dbuser.content;
    if (addreq.message.content && !addreq.message.content.hidden) {
        content = [...dbuser.content, addreq.message.content];
	content.sort((a,b) => (a.sortorder ? a.sortorder : 0)-(b.sortorder ? b.sortorder : 0));
      }

    await req.app.locals.db.collection('Users').updateOne(
            { _id: `${sid}/${gid}/${uid}` },
            { $set: { rewards: rewards, chats: ucs, content: content }});

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({}));
  } catch (error) {
    console.log('Error (add (user) message)', error);
    res.writeHead(500).end(JSON.stringify({error:error}));
  }
}
