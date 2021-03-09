import type { SapperResponse } from '@sapper/server';
import * as t from '../../../../../../../../_types';
import type { ServerRequest } from '../../../../../../../../_servertypes'
import * as xlsx from 'xlsx';

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
    //console.log(`update group ${sid}/${gid} with file ${file.name} (${file.mimetype}, ${file.size} bytes)`);
    const wb = xlsx.read(file.data, {});
    const group = readGroup(wb, sid, gid, dbgroup.site);
    //console.log(`group`, group);
    const chatdefs = readChatDefs(wb, group);
    //console.log(`chatdefs`, chatdefs);
    // find existing chatdefs
    const oldcds = await req.app.locals.db.collection('ChatDefs').find({groupid:group._id})
    .toArray() as t.ChatDef[];
    console.log(`found ${oldcds.length} old ChatDefs for group ${group._id}`);

    await req.app.locals.db.collection('Groups').replaceOne(
	    { _id: group._id }, group);
    await req.app.locals.db.collection('ChatDefs').deleteMany({groupid:group._id});
    await req.app.locals.db.collection('ChatDefs').insertMany(chatdefs);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({}));
  } catch (error) {
    console.log('Error (update group)', error);
    res.writeHead(400).end(JSON.stringify({error:error}));
  }
}

const SUMMARY = "Summary";
const REWARDS = "Rewards";
const CHATS = "Chats";

// excel cell name from column,row (start from 0)
function cellid(c:number,r:number): string {
  let p = String(r+1)
  let rec = (c) => {
    p = String.fromCharCode( ('A'.charCodeAt(0))+(c % 26) ) + p
    c = Math.floor (c/26)
    if (c!=0)
      rec( c-1 )
  }
  rec( c )
  return p
}

interface Row {
  [propName:string]: string
}

// generic spreadsheet sheet type
interface Sheet {
  headings: string[]
  rows: Row[]
}

function readSheet(sheet:xlsx.WorkSheet) : Sheet {
  let headings:string[] = []
  for (let c=0; true; c++) {
    let cell = sheet[cellid(c,0)]
    if (!cell)
      break
    let heading = String(cell.v).trim()
    headings.push(heading)
  }
  let rows:Row[] = []
  for (let r=1; true; r++) {
    let row:Row = {}
    let empty = true
    for (let c=0; c<headings.length; c++) {
      let cell = sheet[cellid(c,r)]
      if (cell) {
        let value = String(cell.v).trim()
        if (value.length>0) {
          row[headings[c]] = value
          empty = false
        }
      }
    }
    if (empty)
      break
    rows.push(row)
  }
  return { headings: headings, rows: rows}
}

const NAME = "name";
const _ID = "_id";
const DESCRIPTION = "description";
const SHOWPUBLIC = "showpublic";
const REQUIREINITIALS = "requireinitials";
const REQUIREPIN = "requirepin";
const REQUIREEMAIL = "requireemail";
const ALLOWSELFENROL = "allowselfenrol";
const ALLOWGUEST = "allowguest";
const PASSWORD = "password"
const SUMMARY_HEADINGS = [NAME, _ID, DESCRIPTION, SHOWPUBLIC,
       	REQUIREINITIALS, REQUIREPIN, REQUIREEMAIL, ALLOWSELFENROL,
	ALLOWGUEST, PASSWORD];
const ICON = "icon";
const NOICON = "noicon";
const COMMENT = "comment";
const REWARDS_HEADINGS = [_ID, ICON, NOICON, COMMENT];

function includesAll(a:string[], inb:string[]) : boolean {
  for (let s of a) {
    if (inb.indexOf(s) < 0) 
      return false;
  }
  return true;
}
function asBoolean(value:string) : boolean {
  return value && value.length>0 && (value.toLowerCase().charAt(0) == 'y' || 
	  value.toLowerCase().charAt(0) == 't');
}

function readGroup(wb:xlsx.WorkBook, sid:string, gid:string, site:t.DBSite) : t.DBGroup {
  //console.log(`readGroup...`);
  const summarysheet = wb.Sheets[SUMMARY];
  if (!summarysheet)
    throw 'Could not find Summary sheet';
  const summary = readSheet(summarysheet);
  if (summary.rows.length!=1)
    throw `Summary sheet should have 1 row; found ${summary.rows.length}`;
  if (!includesAll(SUMMARY_HEADINGS, summary.headings))
    throw `Summary sheet is missing heading(s); found ${summary.headings}`;
  let group:t.DBGroup = {
    id: gid,
    _id: `${sid}/${gid}`,
    name: summary.rows[0][NAME],
    description: summary.rows[0][DESCRIPTION],
    showpublic: asBoolean(summary.rows[0][SHOWPUBLIC]),
    requireinitials: asBoolean(summary.rows[0][REQUIREINITIALS]),
    requirepin: asBoolean(summary.rows[0][REQUIREPIN]),
    requireemail: asBoolean(summary.rows[0][REQUIREEMAIL]),
    allowselfenrol: asBoolean(summary.rows[0][ALLOWSELFENROL]),
    allowguest: asBoolean(summary.rows[0][ALLOWGUEST]),
    password: summary.rows[0][PASSWORD],
    rewards: [], //later
    site: site,
  };
  // rewards
  const rewardssheet = wb.Sheets[REWARDS];
  if (!rewardssheet)
    throw 'Could not find Rewards sheet';
  const rewards = readSheet(rewardssheet);
  if (!includesAll(REWARDS_HEADINGS, rewards.headings))
    throw `Rewards sheet is missing heading(s); found ${rewards.headings}`;
  for (let r of rewards.rows) {
    group.rewards.push({
      _id: r[_ID],
      icon: r[ICON],
      noicon: r[NOICON],
      comment: r[COMMENT],
    });
  }
  return group;
}

const SORTORDER = "sortorder";
const IFALL = "ifall";
const ANDNOT = "andnot";
const CHATS_HEADINGS = [NAME, _ID, DESCRIPTION, ICON, SORTORDER, IFALL, ANDNOT];

function splitRewards(value:string, group:t.DBGroup) : string[] {
  if (!value) 
    return [];
  const rs = value.split(', \t;');
  for (let r of rs) {
    if (!group.rewards.find(rw => rw._id ==r))
      throw `Found unknown reward ${r}`;
  }
  return rs;
}

function readChatDefs(wb:xlsx.WorkBook, group:t.DBGroup): t.ChatDef[] {
  let cds: t.ChatDef[] = [];
  const sheet = wb.Sheets[CHATS];
  if (!sheet)
    throw 'Could not find Chats sheet';
  const chats = readSheet(sheet);
  if (!includesAll(CHATS_HEADINGS, chats.headings))
    throw `Chats sheet is missing heading(s); found ${chats.headings}`;
  for (let r of chats.rows) {
    cds.push({
      id: r[_ID],
      _id: `${group._id}/${r[_ID]}`,
      groupid: group._id,
      ifall: splitRewards(r[IFALL], group),
      andnot: splitRewards(r[ANDNOT], group),
      sortorder: Number(r[SORTORDER]),
      name: r[NAME],
      description: r[DESCRIPTION],
      icon: r[ICON],
      messages: readMessageDefs(wb, r[_ID], group),
    });
  }
  return cds;
}

const LABEL = "label";
const AFTER = "after";
const WAITFOR = "waitfor";
const ORNEXT = "ornext";
const MESSAGE = "message";
const TYPE = "type";
const URL = "url";
const TITLE = "title";
const SECTION = "section";
const HIDDEN = "hidden";
const _REWARDS = "rewards";
const RESET = "reset";
const JUMPTO = "jumpto";
const CHAT_HEADINGS = [LABEL, IFALL, ANDNOT, AFTER, WAITFOR, ORNEXT, 
	MESSAGE, TYPE, URL, TITLE, DESCRIPTION, SECTION, SORTORDER,
	HIDDEN, _REWARDS, RESET, JUMPTO];

function readMessageDefs(wb:xlsx.WorkBook, id:string, group:t.DBGroup): t.MessageDef[] {
  let mds:t.MessageDef[] = []
  const sheet = wb.Sheets[id];
  if (!sheet)
    throw `Could not find Chat ${id} sheet`;
  const messages = readSheet(sheet);
  if (!includesAll(CHAT_HEADINGS, messages.headings))
    throw `Chat ${id} sheet is missing heading(s); found ${messages.headings} vs ${CHAT_HEADINGS}`;
  for (let r of messages.rows) {
    mds.push({
      label: r[LABEL],
      ifall: splitRewards(r[IFALL], group),
      andnot: splitRewards(r[ANDNOT], group),
      after: r[AFTER] ? Number(r[AFTER]) : null,
      waitfor: r[WAITFOR],
      ornext: asBoolean(r[ORNEXT]),
      message: r[MESSAGE],
      content: r[URL] ? {  
        _id: `${group._id}/${id}/${mds.length}`,
	title: r[TITLE],
	description: r[DESCRIPTION],
	section: r[SECTION],
	sortorder: r[SORTORDER] ? 0 : Number(r[SORTORDER]),
	type: getContentType(r[TYPE]),
        url: r[URL],
	hidden: asBoolean(r[HIDDEN]),
      } : null,
      rewards: splitRewards(r[_REWARDS], group),
      reset: splitRewards(r[RESET], group),
      jumpto: r[JUMPTO],
    });
  }
  return mds;
}

function getContentType(value:string) : t.ContentType {
  if (!value)
    return t.ContentType.unspecified;
  const v = value.toLowerCase();
  if (v == 'image')
    return t.ContentType.image;
  else if (v == 'youtube')
    return t.ContentType.youtube;
  else if (v == 'mp3')
    return t.ContentType.mp3;
  else if (v == 'document')
    return t.ContentType.document;
  else if (v == 'website')
    return t.ContentType.website;
  throw `Unknown message content type, ${value}`;
}
