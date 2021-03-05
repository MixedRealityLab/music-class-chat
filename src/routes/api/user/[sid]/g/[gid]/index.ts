import type { SapperResponse } from '@sapper/server';
import type * as t from '../../../../../../_types';
import type { ServerRequest } from '../../../../../../_servertypes'

export async function get(req: ServerRequest, res: SapperResponse, next: () => void) {
  try {
    const { sid, gid } = req.params;
    if (!sid || !gid) {
      res.writeHead(400).end(JSON.stringify({error:'Bad Request'}));
      return;
    }

    const dbgroup = await req.app.locals.db.collection('Groups').findOne(
	{ _id: `${sid}/${gid}` }
    ) as t.DBGroup;
    console.log(`get group ${sid}/${gid}`, dbgroup);
    if (!dbgroup) {
      await req.app.locals.db.collection('Groups').insertOne({
	      _id: `${sid}/${gid}`, name: "internal", 
	      description: "debug", admins: []
      })
      res.writeHead(404).end(JSON.stringify({error:'Not Found'}));
      return;
    }
    const ugroup: t.UGroup = {
      _id: dbgroup._id, 
      name: dbgroup.name,
      description: dbgroup.description,
      showpublic: dbgroup.showpublic,
      requireinitials: dbgroup.requireinitials,
      requirepin: dbgroup.requirepin,
      requireemail: dbgroup.requireemail,
      allowselfenrol: dbgroup.allowselfenrol,
      allowguest: dbgroup.allowguest,
      site: {
        _id: dbgroup.site._id,
      },
    };
    //console.log('group', ugrop);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(ugroup));
  } catch (error) {
    console.log('Error (get (user) group)', error);
    res.writeHead(500).end(JSON.stringify({error:error}));
  }
}
