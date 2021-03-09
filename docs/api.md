# API

Note:
- `sid` = site id
- `gid` = group id
- `uid` = usercode

User signup:
- [x] `/user/sid:/g/gid:`, GET, returns (filtered) UGroup
- [x] `/user/sid:/g/gid:/signup`, POST(any), SignupRequest -> SignupResponse

User path(s):
- [x] `/user/sid:/g/gid:/u/uid:/`, GET(any), return UUser
- [x] `/user/sid:/g/gid:/u/uid:/c/cid:/` - GET(any), return UserChat
- [ ] `/user/sid:/g/gid:/u/uid:/c/cid:/` - PUT(PATCH), UserChatPatchRequest, 
  return {error?}
- [x] `/user/sid:/g/gid:/u/uid:/c/cid:/addmessage` - POST(any), AddUserMessageRequest
  return {error?}
  Note, also updates all UserChats visible/enabled/waiting and User content
  and rewards (needs to be done on both client and server)

Admin paths:
- [ ] `/admin/sid:/requestsession`, POST, {email}
- [ ] `/admin/sid:/s/sessionid:/startsession`, POST, {email,password}
- [ ] `/admin/sid:/s/sessionid:/g/` GET - all groups
- [ ] `/admin/sid:/s/sessionid:/addgroup` POST (form) - add group, including 
  'spreadsheet', return AddGroupResponse
- [ ] `/admin/sid:/s/sessionid:/g/gid:/u/` GET - group users
- [ ] `/admin/sid:/s/sessionid:/g/gid:/u/` POST - add user AUser (ignore _id) 
  -> AUser
- [x] `/admin/sid:/s/sessionid:/g/gid:/update` POST (form) - including 
  'spreadsheet' -> AGroup
- [ ] `/admin/sid:/s/sessionid:/g/gid:/sendmessage` POST - SendMessageRequest
- [ ] `/admin/sid:/endsession` POST - end current admin session


