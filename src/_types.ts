// types specific to user client

// Site / organisation - User view
export interface USite {
  _id: string;
  // TODO: CSS, etc.
}

// ... Admin view
export interface ASite extends USite {
  name: string;
  description: string;
  admins: AAdmin[];
}

// ... DB (server) view
export interface DBSite extends USite {
  name: string;
  description: string;
  admins: DBAdmin[];
}

// Admin within Site, Admin view
export interface AAdmin {
  email: string;
  enabled: boolean;
}

export interface DBAdmin extends AAdmin {
  password: string;
}

export interface AdminSession {
  admin: string;
  password: string;
  sessionkey: string;
  sessionexpires: string; // ISO date
}

// Group, User view
interface UGroupSummaryBase {
  id: string;
  _id: string;
  name: string;
  description: string;
}
interface UGroupBase extends UGroupSummaryBase {
  showpublic: boolean;
  requireinitials: boolean;
  requirepin: boolean;
  requireemail: boolean;
  allowselfenrol: boolean;
  allowguest: boolean;
}
export interface UGroupSummary extends UGroupSummaryBase {
  site: USite;
}
export interface UGroup extends UGroupBase {
  site: USite;
}

// ... Admin view
export interface AGroupBase {
  password?: string;
  rewards: Reward[];
}
export interface AGroup extends UGroupBase, AGroupBase {
  site: ASite;
}

// ... DB view
export interface DBGroup extends UGroupBase, AGroupBase {
  site: DBSite;
}

// Reward - no filtering needed
export interface Reward {
  _id: string;
  icon?: string;
  noicon?: string;
  comment?: string;
}

// User, user view
export interface UUser {
  _id: string; // site/group/usercode
  usercode: string;
  groupid: string;
  group: UGroupSummary;
  rewards: UserReward[];
  chats: UserChatSummary[];
  content: Content[];
  created: string; // Date
}
export interface AUser extends UUser {
  initials?: string;
  pin?: string;
  lastmodified: string; // Date
}
export interface DBUser extends AUser {
}

// UserReward in User
export interface UserReward {
  _id: string;
  icon?: string;
  noicon?: string;
  got: boolean;
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
  _id: string;
  title: string;
  description?: string;
  section?: string;
  sortorder: number;
  type: ContentType;
  url: string;
  hidden?: boolean;
}

// MessageDef, in ChatDef
export interface MessageDef {
  label?: string;
  ifall?: string[];
  andnot?: string[];
  after?: number;
  waitfor?: string;
  ornext: boolean;
  message?: string;
  content?: Content;
  rewards?: string[];
  reset?: string[];
  jumpto?: string;
}

// ChatDef minus messages
export interface ChatDefSummary {
  id: string;
  _id: string;
  groupid: string;
  ifall?: string[];
  andnot?: string[];
  sortorder: number;
  name: string;
  description: string;
  icon: string;
}

// full ChatDef
export interface ChatDef extends ChatDefSummary {
  messages: MessageDef[];
}

// UserMessage
export interface UserMessage {
  userinput?: string;
  message?: string;
  content?: Content;
  rewardicons?: string[];
  date: string; // Date
}

// UserChat minus messages
export interface UserChatSummary {
  _id: string;
  chatdef: ChatDefSummary;
  enabled: boolean;
  unread: boolean;
  waiting: boolean;
  nextix: number;
}

// full UserChat
export interface UserChat extends UserChatSummary {
  messages: UserMessage[];
}

// message - 
// generic ok/error
export interface GenericResponse {
  error?: string;
}

// User signup
export interface SignupRequest {
  password?: string; // group password
  initials?: string;
  email?: string;
  pin?: string;
  anon: boolean;
}
export interface SignupResponse {
  error?: string;
  usercode?: string;
}

// User patch chat (unread)
export interface UserChatPatchRequest {
  unread: boolean;
}

// add user message
export interface AddUserMessageRequest {
  message:UserMessage;
  rewards?:string[];
  reset?:string[];
  nextix:number;
  waiting:boolean;
}

// admin request session
export interface RequestSessionRequest {
  email: string;
}

// admin start session
export interface StartSessionRequest {
  email: string;
  password?: string;
}

// admin add group
export interface AddGroupResponse {
  groupid: string;
}

// add message
export interface SendMessageRequest {
  // message core
  message?: string;
  content?: Content;
  rewardicons?: string[];
  rewards?: string[];
  reset?: string[];
  // metadata
  chatid?: string;
  notify: boolean;
}

//EOF
