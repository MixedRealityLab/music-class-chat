import type { SapperResponse } from '@sapper/server';
import type * as t from '../../../../../../../../_types';
import type { ServerRequest } from '../../../../../../../../_servertypes'

export async function post(req: ServerRequest, res: SapperResponse, next: () => void) {
  try {
    const { sid, sessionid, gid } = req.params;
    const file = req.files.spreadsheet;
    if (!sid || !gid || !file) {
      res.writeHead(400).end(JSON.stringify({error:'Bad Request'}));
      return;
    }
    // TODO sessionid security

    const dbgroup = await req.app.locals.db.collection('Groups').findOne(
	{ _id: `${sid}/${gid}` }
    ) as t.DBGroup;
    if (!dbgroup) {
      res.writeHead(404).end(JSON.stringify({error:'Not Found'}));
      return;
    }
    console.log(`update group ${sid}/${gid} with file ${file.name} (${file.mimetype}, ${file.size} bytes)`);
    // TODO...

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({}));
  } catch (error) {
    console.log('Error (update group)', error);
    res.writeHead(500).end(JSON.stringify({error:error}));
  }
}
