import {getDb} from "$lib/db";
import {isValidAdminSession} from "$lib/session"
import type {LogItem} from "$lib/types";
import {LogType} from "$lib/types";
import type {EndpointOutput, Request} from "@sveltejs/kit";

export async function get(req: Request): Promise<EndpointOutput> {
	const {gid} = req.params

	if (!gid) {
		return {status: 400, body: {error: 'Bad Request'}}
	}

	if (!await isValidAdminSession(req)) {
		return {status: 401, body: {error: 'Unauthorized'}}
	}

	const db = await getDb()
	const items = await db.collection<LogItem>('EventLog')
		.find({"uid": {$regex: `^${gid}`}})
		.sort({
			"uid": 1,
			"timestamp": 1
		}).toArray()
	const data = []
	let line = {
		x: [],
		y: [],
		text: [],
		mode: 'lines+markers',
		name: '',
		marker: {
			color: [],
			size: 16
		},
		line: {
			color: 'rgba(128, 128, 128, 0.5)',
			width: 2
		}
	}
	let previousItemId = ''

	items.forEach((item) => {
		if (item.uid !== previousItemId) {
			line = {
				x: [],
				y: [],
				text: [],
				mode: 'lines+markers',
				name: item.uid,
				marker: {
					color: [],
					size: 16
				},
				line: {
					color: 'rgba(128, 128, 128, 0.5)',
					width: 2
				}
			}
			previousItemId = item.uid
			data.push(line)
		}
		if (item.type == LogType.SignUp) {
			line.marker.color.push('#ffa60066')
			line.y.push(item.uid)
			line.x.push(new Date(item.timestamp).toISOString())
			line.text.push(item.type)
		} else if (item.type == LogType.Chat) {
			line.marker.color.push('#003f5c66')
			line.y.push(item.uid)
			line.x.push(new Date(item.timestamp).toISOString())
			line.text.push(item.type)
		} else if (item.type == LogType.Reward) {
			line.marker.color.push('#bc509033')
			line.y.push(item.uid)
			line.x.push(new Date(item.timestamp).toISOString())
			line.text.push('Rewarded ' + item.content)
		}
	})
	return {body: data}
}