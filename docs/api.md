# API

Note:
- `sid` = site id
- `gid` = group id
- `uid` = usercode

User signup:
- `/user/sid:/g/gid:`, GET, returns (filtered) Group (name, description, public,
  showpublic, site)
- `/user/sid:/g/gid:/signup`, POST(any), JSON object w (group) password; returns 
  object w uid (expects client redirect)

User path(s):
- `/user/sid:/g/gid:/u/uid:/`, GET(any), return User
- `/user/sid:/g/gid:/u/uid:/c/cid:/` - GET(any), return UserChat
- `/user/sid:/g/gid:/c/cid:/` - GET(any), return ChatDef
- `/user/sid:/g/gid:/u/uid:/c/cid:/` - PUT(PATCH), JSON object w unread
- `/user/sid:/g/gid:/u/uid:/c/cid:/messages/` - POST(any), JSON object 
  w usermessage, reset, (UserChat) nextix, waiting, contentid - 
  also updates all UserChats visible/enabled/waiting and User content
  and rewards

Admin paths:
- `/admin/sid:/requestsession`, POST, {email}
- `/admin/sid:/s/sessionid:/startsession`, POST, {email,password}
- `/admin/sid:/s/sessionid:/g/` GET - all groups
- `/admin/sid:/s/sessionid:/addgroup` POST (form) - add group, including spreadsheet, return group ID
- `/admin/sid:/s/sessionid:/g/gid:/u/` GET - group users
- `/admin/sid:/s/sessionid:/g/gid:/u/` POST - add user
- `/admin/sid:/s/sessionid:/g/gid:/update` POST (form) - including spreadsheet
- `/admin/sid:/s/sessionid:/g/gid:/m/` POST - add message
- `/admin/sid:/endsession` POST - end current admin session


