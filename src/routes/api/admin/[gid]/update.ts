import {getDb} from "$lib/db";
import {getAdmin, isValidAdminSession} from "$lib/session"
import type {ChatDef, DBGroup, MessageDef} from "$lib/types";
import {ContentType, LogItem, LogType} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";
import type {Db} from "mongodb"
import * as xlsx from 'xlsx'

export async function post(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params
	const body = req.body as ReadOnlyFormData
	const file = body.get('spreadsheet')
	const buffer = Buffer.from(file, 'base64')

	if (!gid || !file) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const db = await getDb()
	const dbgroup = await db.collection<DBGroup>('Groups').findOne(
		{_id: gid}
	)
	if (!dbgroup) {
		return {status: 404, body: {error: 'Group Doesn\'t Exists'}}
	}

	//console.log(`update group ${gid} with file ${file.name} (${file.mimetype}, ${file.size} bytes)`)
	await readXlsx(gid, buffer, db)
	await db.collection<LogItem>('EventLog').insertOne({
		timestamp: new Date().getTime(),
		type: LogType.Admin,
		uid: await getAdmin(req),
		content: 'Updated Spreadsheet'
	})

	return {body: {}}
}

const SUMMARY = "Summary"
const REWARDS = "Rewards"
const CHATS = "Chats"

export async function readXlsx(gid: string, fileData: Buffer, db: Db): Promise<DBGroup> {
	const wb = xlsx.read(fileData, {})
	const group = readGroup(wb, gid)
	//console.log(`group`, group)
	const requiredRewards = {}
	const declaredRewards = {}
	const chatdefs = readChatDefs(wb, group, requiredRewards, declaredRewards)

	for (const requiredReward in requiredRewards) {
		if (!(requiredReward in declaredRewards)) {
			const location = requiredRewards[requiredReward]
			throw `Reward ${requiredReward} not declared. Used at ${location.column}, row ${location.row} in ${location.sheet}`
		}
	}

	for (const declaredReward in declaredRewards) {
		const reward = group.rewards.find((reward) => reward._id == declaredReward)
		if (reward == null) {
			group.rewards.push({
				_id: declaredReward
			})
		}
	}

	const oldcds = await db.collection('ChatDefs').countDocuments({groupid: group._id})
	console.log(`found ${oldcds} old ChatDefs for group ${group._id}`)

	await db.collection('Groups').replaceOne({_id: group._id}, group)
	await db.collection('ChatDefs').deleteMany({groupid: group._id})
	await db.collection('ChatDefs').insertMany(chatdefs)
	return group
}

// excel cell name from column,row (start from 0)
function cellid(c: number, r: number): string {
	let p = String(r + 1)
	const rec = (c) => {
		p = String.fromCharCode(('A'.charCodeAt(0)) + (c % 26)) + p
		c = Math.floor(c / 26)
		if (c != 0)
			rec(c - 1)
	}
	rec(c)
	return p
}

interface Location {
	sheet: string,
	row: number,
	column: string
}

interface Row {
	[propName: string]: string
}


// generic spreadsheet sheet type
interface Sheet {
	headings: string[]
	rows: Row[]
}

function readSheet(sheet: xlsx.WorkSheet): Sheet {
	const headings: string[] = []
	for (let c = 0; true; c++) {
		const cell = sheet[cellid(c, 0)]
		if (!cell)
			break
		const heading = String(cell.v).trim()
		headings.push(heading)
	}
	const rows: Row[] = []
	for (let r = 1; true; r++) {
		const row: Row = {}
		let empty = true
		for (let c = 0; c < headings.length; c++) {
			const cell = sheet[cellid(c, r)]
			if (cell) {
				const value = String(cell.v).trim()
				if (value.length > 0) {
					row[headings[c]] = value
					empty = false
				}
			}
		}
		if (empty)
			break
		rows.push(row)
	}
	return {headings: headings, rows: rows}
}

const NAME = "name"
const _ID = "_id"
const DESCRIPTION = "description"
const SHOWPUBLIC = "showpublic"
const REQUIREINITIALS = "requireinitials"
const REQUIREPIN = "requirepin"
const REQUIREEMAIL = "requireemail"
const ALLOWSELFENROL = "allowselfenrol"
const ALLOWGUEST = "allowguest"
const PASSWORD = "password"
const SUMMARY_HEADINGS = [NAME, _ID, DESCRIPTION, SHOWPUBLIC,
	REQUIREINITIALS, REQUIREPIN, REQUIREEMAIL, ALLOWSELFENROL,
	ALLOWGUEST, PASSWORD]
const ICON = "icon"
const NOICON = "noicon"
const COMMENT = "comment"
const REWARDS_HEADINGS = [_ID, ICON, NOICON, COMMENT]

function includesAll(a: string[], inb: string[]): boolean {
	for (const s of a) {
		if (inb.indexOf(s) < 0)
			return false
	}
	return true
}

function asBoolean(value: string): boolean {
	return value && value.length > 0 && (value.toLowerCase().charAt(0) == 'y' ||
		value.toLowerCase().charAt(0) == 't')
}

function readGroup(wb: xlsx.WorkBook, gid: string): DBGroup {
	//console.log(`readGroup...`)
	const summarysheet = wb.Sheets[SUMMARY]
	if (!summarysheet)
		throw 'Could not find Summary sheet'
	const summary = readSheet(summarysheet)
	if (summary.rows.length != 1)
		throw `Summary sheet should have 1 row; found ${summary.rows.length}`
	if (!includesAll(SUMMARY_HEADINGS, summary.headings))
		throw `Summary sheet is missing heading(s); found ${summary.headings}`
	const group: DBGroup = {
		_id: gid,
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
	}
	// rewards
	const rewardssheet = wb.Sheets[REWARDS]
	if (!rewardssheet)
		throw 'Could not find Rewards sheet'
	const rewards = readSheet(rewardssheet)
	if (!includesAll(REWARDS_HEADINGS, rewards.headings))
		throw `Rewards sheet is missing heading(s); found ${rewards.headings}`
	for (const r of rewards.rows) {
		group.rewards.push({
			_id: r[_ID],
			icon: r[ICON],
			noicon: r[NOICON],
			comment: r[COMMENT],
		})
	}
	return group
}

const SORTORDER = "sortorder"
const IFALL = "ifall"
const ANDNOT = "andnot"
const PRIMARYCOLOUR = "primaryColour"
const SECONDARYCOLOUR = "secondaryColour"

const CHATS_HEADINGS = [NAME, _ID, DESCRIPTION, ICON, PRIMARYCOLOUR, SECONDARYCOLOUR, SORTORDER, IFALL, ANDNOT]

function splitRewards(value: string, location: Location, rewardList): string[] {
	if (!value) {
		return []
	}
	const rewards = value
		.toLowerCase()
		.split(new RegExp("[,\\s;]+"))
		.filter((reward) => reward !== '')
		.map((reward) => reward.indexOf(':') > 0 ? reward : location.sheet.toLowerCase() + ":" + reward)
	rewards.forEach((reward) => {
		if (!(reward in rewardList)) {
			rewardList[reward] = location
		}
	})
	return rewards
}

function readChatDefs(wb: xlsx.WorkBook, group: DBGroup, requiredRewards, declaredRewards): ChatDef[] {
	const cds: ChatDef[] = []
	const sheet = wb.Sheets[CHATS]
	if (!sheet)
		throw 'Could not find Chats sheet'
	const chats = readSheet(sheet)
	if (!includesAll(CHATS_HEADINGS, chats.headings))
		throw `Chats sheet is missing heading(s) found ${chats.headings}, expected ${CHATS_HEADINGS}`
	for (const r of chats.rows) {
		const rowNumber = chats.rows.indexOf(r)
		cds.push({
			id: r[_ID],
			_id: `${group._id}/${r[_ID]}`,
			groupid: group._id,
			ifall: splitRewards(r[IFALL], {sheet: CHATS, row: rowNumber, column: IFALL}, requiredRewards),
			andnot: splitRewards(r[ANDNOT], {sheet: CHATS, row: rowNumber, column: ANDNOT}, requiredRewards),
			sortorder: r[SORTORDER] ? Number(r[SORTORDER]) : 0,
			name: r[NAME],
			description: r[DESCRIPTION],
			icon: r[ICON],
			primaryColour: r[PRIMARYCOLOUR],
			secondaryColour: r[SECONDARYCOLOUR],
			messages: readMessageDefs(wb, r[_ID], group, requiredRewards, declaredRewards),
		})
	}
	return cds
}

const LABEL = "label"
const AFTER = "after"
const WAITFOR = "waitfor"
const ORNEXT = "ornext"
const MESSAGE = "message"
const TYPE = "type"
const URL = "url"
const TITLE = "title"
const SECTION = "section"
const HIDDEN = "hidden"
const _REWARDS = "rewards"
const RESET = "reset"
const JUMPTO = "jumpto"
const CHAT_HEADINGS = [LABEL, IFALL, ANDNOT, AFTER, WAITFOR, ORNEXT,
	MESSAGE, TYPE, URL, TITLE, DESCRIPTION, SECTION, SORTORDER,
	HIDDEN, _REWARDS, RESET, JUMPTO]

function readMessageDefs(wb: xlsx.WorkBook, id: string, group: DBGroup, requiredRewards, declaredRewards): MessageDef[] {
	const mds: MessageDef[] = []
	const sheet = wb.Sheets[id]
	if (!sheet)
		throw `Could not find Chat ${id} sheet`
	const messages = readSheet(sheet)
	if (!includesAll(CHAT_HEADINGS, messages.headings))
		throw `Chat ${id} sheet is missing heading(s); found ${messages.headings} vs ${CHAT_HEADINGS}`
	for (const r of messages.rows) {
		const rowNumber = messages.rows.indexOf(r)
		mds.push({
			label: r[LABEL],
			ifall: splitRewards(r[IFALL], {sheet: id, row: rowNumber, column: IFALL}, requiredRewards),
			andnot: splitRewards(r[ANDNOT], {sheet: id, row: rowNumber, column: IFALL}, requiredRewards),
			after: r[AFTER] ? Number(r[AFTER]) : null,
			waitfor: r[WAITFOR],
			ornext: asBoolean(r[ORNEXT]),
			message: r[MESSAGE],
			content: r[URL] ? {
				_id: `${group._id}/${id}/${mds.length}`,
				title: r[TITLE],
				description: r[DESCRIPTION],
				section: r[SECTION],
				sortorder: r[SORTORDER] ? Number(r[SORTORDER]) : 0,
				type: getContentType(r[TYPE]),
				url: r[URL],
				hidden: asBoolean(r[HIDDEN]),
			} : null,
			rewards: splitRewards(r[_REWARDS], {sheet: id, row: rowNumber, column: IFALL}, declaredRewards),
			reset: splitRewards(r[RESET], {sheet: id, row: rowNumber, column: IFALL}, requiredRewards),
			jumpto: r[JUMPTO],
		})
		//console.log(`sortorder = ${r[SORTORDER]}`)
	}
	return mds
}

function getContentType(value: string): ContentType {
	if (!value)
		return ContentType.unspecified
	const v = value.toLowerCase()
	if (v == 'image')
		return ContentType.image
	else if (v == 'youtube')
		return ContentType.youtube
	else if (v == 'mp3')
		return ContentType.mp3
	else if (v == 'document')
		return ContentType.document
	else if (v == 'website')
		return ContentType.website
	throw `Unknown message content type, ${value}`
}
