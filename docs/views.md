# views

## end user

Note:
- `sid` = site id
- `gid` = group id

- `/sid:/` - site home - public group list?

Signup path(s):
- `/sid:/g/gid:/` - home? (public)
- `/sid:/g/gid:/signup` - sign-up form, requires passcode

User path(s):
- `/sid:/g/gid:/u/uid:/` - home, on chats tab
- `/sid:/g/gid:/u/uid:/rewards` - rewards tab
- `/sid:/g/gid:/u/uid:/resources` - resources tab
- `/sid:/g/gid:/u/uid:/resources/cid:` - zoom in on specific UserContent
- `/sid:/g/gid:/u/uid:/settings` - settings tab
- `/sid:/g/gid:/u/uid:/c/cid:/` - specific chat
- `/sid:/g/gid:/u/uid:/c/cid:/mix:` - zoom in on specific UserMessage (index)

## Admin

- `/sid:/admin` - admin session request form - enter email
- `/sid:/admin/sessionid:/` - admin session home
- `/sid:/admin/sessionid:/addgroup` - add group
- `/sid:/admin/sessionid:/g/gid:/` - group admin home
- `/sid:/admin/sessionid:/g/gid:/users` - users list
- `/sid:/admin/sessionid:/g/gid:/update` - edit/update a group
- `/sid:/admin/sessionid:/g/gid:/adduser` - add a user
- `/sid:/admin/sessionid:/g/gid:/addmessage` - post a new message
- `/sid:/admin/sessionid:/endsession` - end session (early)

