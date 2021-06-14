import type {Response} from 'express'
import type {ServerRequest} from "../../../../_servertypes"
import type {LogItem} from "../../../../_types"
import {LogType} from "../../../../_types"
import {isValidAdminSession} from "../_session"

export async function get(req: ServerRequest, res: Response) {
	try {
		const {gid} = req.params

		if (!gid) {
			res.status(400).json({error: 'Bad Request'})
			return
		}

		if (!await isValidAdminSession(req)) {
			res.status(401).json({error: 'Unauthorized'})
		}

		const items = await req.app.locals.db.collection<LogItem>('EventLog')
			.find({"uid": {$regex: `^${gid}`}})
			.sort({
				"uid": 1,
				"timestamp": 1
			}).toArray()
		let data = []
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
		let itemCount = 0

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
				itemCount = 0
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
		res.json(data)
	} catch (error) {
		console.log('Error (update group)', error);
		res.status(500).json({error: error})
	}
}