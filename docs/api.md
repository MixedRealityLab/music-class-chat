# API

Note:
- `sid` = site id
- `gid` = group id
- `uid` = usercode

User signup:
- `/sid:/gid:`, GET, returns (filtered) Group (name, description, public,
  showpublic, site)
- `/sid:/gid:/signup`, POST(any), JSON object w (group) password; returns 
  object w uid (expects client redirect)

User path(s):
- `/sid:/gid:/user/uid:/`, GET(any), return User
- `/sid:/gid:/user/uid:/chat/cid:/` - GET(any), return UserChat
- `/sid:/gid:/user/uid:/chat/cid:/` - PATCH, JSON object w unread
- `/sid:/gid:/user/uid:/chat/cid:/addmessage` - POST(any), JSON object 
  w usermessage, reset, (UserChat) nextix, waiting, contentid - 
  also updates all UserChats visible/enabled/waiting and User content
  and rewards

