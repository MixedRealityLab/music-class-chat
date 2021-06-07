import type * as sapper from '@sapper/server'
import type {UploadedFile} from "express-fileupload"
import type {Db} from 'mongodb'

interface App {
	locals: AppLocals
}

interface AppLocals {
	db: Db
}

interface MyFiles {
	spreadsheet?: UploadedFile
	files?: UploadedFile | UploadedFile[]
}

export interface ServerRequest extends sapper.SapperRequest {
	session: any
	app: App
	files: MyFiles
	body?: any
	protocol: string
	hostname: string
}
