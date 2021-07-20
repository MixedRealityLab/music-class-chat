export const idAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// types specific to user client

export interface AFile {
	path: string
}

export interface DBAdmin {
	password: string
	salt: string
	_id: string
	enabled: boolean
}

export interface AdminSession {
	id: string
	email: string
	password: string
	expires: string // ISO date
}

// Group, User view
interface UGroupSummaryBase {
	_id: string
	name: string
	description: string
}

interface UGroupBase extends UGroupSummaryBase {
	showpublic: boolean
	requireinitials: boolean
	requirepin: boolean
	requireemail: boolean
	allowselfenrol: boolean
	allowguest: boolean
}

export interface UGroupSummary extends UGroupSummaryBase {
}

export interface UGroup extends UGroupBase {
}

// ... Admin view
export interface AGroupBase {
	password?: string
	rewards: Reward[]
}

// ... DB view
export interface DBGroup extends UGroupBase, AGroupBase {
}

// Reward - no filtering needed
export interface Reward {
	_id: string
	icon?: string
	noicon?: string
	comment?: string
}

// User, user view
export interface UUser {
	_id: string // group/usercode
	usercode: string
	groupid: string
	group: UGroupSummary
	rewards: UserReward[]
	chats: UserChatSummary[]
	content: Content[]
	messages: Message[]
	created: string // Date
}

export interface Message {
	text: string
	read: boolean
	fromUser: boolean
	timestamp: string
}

export interface AUser extends UUser {
	initials?: string
	pin?: string
	lastmodified: string // Date
}

export interface DBUser extends AUser {
}

// UserReward in User
export interface UserReward {
	_id: string
	icon?: string
	noicon?: string
	got: boolean
}

// ContentType
export enum ContentType {
	unspecified,
	image = 1,
	youtube = 2,
	mp3 = 3,
	document = 4,
	website = 5,
}

// Content, used in `User.content`, `UserMessage` and `MessageDef`
export interface Content {
	_id: string
	title: string
	description?: string
	section?: string
	sortorder: number
	type: ContentType
	url: string
	hidden?: boolean
}

// MessageDef, in ChatDef
export interface MessageDef {
	label?: string
	ifall?: string[]
	andnot?: string[]
	after?: number
	waitfor?: string
	ornext: boolean
	message?: string
	content?: Content
	rewards?: string[]
	reset?: string[]
	jumpto?: string
}

// ChatDef minus messages
export interface ChatDefSummary {
	id: string
	_id: string
	groupid: string
	ifall?: string[]
	andnot?: string[]
	sortorder: number
	name: string
	description: string
	icon?: string
	primaryColour?: string
	secondaryColour?: string
}

// full ChatDef
export interface ChatDef extends ChatDefSummary {
	messages: MessageDef[]
}

// UserMessage
export interface UserMessage {
	userinput?: string
	message?: string
	style?: string
	content?: Content
	rewardicons?: string[]
	date: string // Date
}

// UserChat minus messages
export interface UserChatSummary {
	_id: string
	chatdef: ChatDefSummary
	enabled: boolean
	unread: boolean
	waiting: boolean
	nextix: number
	allof?: string[]
	andnot?: string[]
}

// full UserChat
export interface UserChat extends UserChatSummary {
	messages: UserMessage[]
}

// message - 
// generic ok/error
export interface GenericResponse {
	error?: string
}

// User signup
export interface SignupRequest {
	password?: string // group password
	initials?: string
	email?: string
	pin?: string
	anon: boolean
}

export interface SignupResponse {
	error?: string
	usercode?: string
}

// add user message
export interface AddUserMessageRequest {
	message: UserMessage
	rewards?: string[]
	reset?: string[]
	nextix: number
	waiting: boolean
}

export enum LogType {
	Admin = 'Admin',
	Error = 'Error',
	SignUp = 'SignUp',
	Chat = 'Chat',
	Reward = 'Reward'
}

export interface LogItem {
	type: LogType,
	uid: string,
	timestamp: number,
	content?: string,
	userAgent?: string
}

//EOF
