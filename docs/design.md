# music chat design

## overview

- The interaction is based on a standard chat app.
- It is personal but anonymous.
- It is delivered as a progressive web app with responsible layout;
  on desktop the extra space may be used to display multiple views
  side-by-side, including content documents/videos.
- A single server may host different organisations (sites).
- Each site may have its own branding.
- A single organisation may offer different experiences/versions 
  to different groups or at different times.
- Interaction is broken down into something equivalent to "chats"
  (or groups or users), but which may represent (e.g.) different topics.
- There is a reward system based on visible stickers/badges.
  (There may also be invisible "rewards", i.e. internal state.)
- Access to chats and delivery of content can be based on which rewards
  the user has. Rewards can be given within chats.
- The dialog system within a single chat is very simple, and will be
  limited to closed multiple choice responses.
- Most content will be static/pre-configured.
- At least initially, authoring will be by populating a spreadsheet template.
- It may be possible to post additional messages to a group.
- Content (links) can be delivered through the chat including videos
  (most likely hosted on YouTube), images, audio files, documents and
  web pages (links).
- There *may* be some integration with e.g. google classrooms for user
  uploads/submissions.

Assuming MongoDB for now.

See [example config spreadsheet](../data/example-config.xlsx)

## Security and accounts

Admin
- whitelisted emails, per site or group
- request admin session - enter email, get temporary link
- maybe require email again and a password
- send all admin email on significant changes

users
- identified by allocated ID/code in link
- group option to require 'initials'
- group option to require an email (not stored) to sent link to
- group option to allow self-enrolment
- group option to require PIN?

## Data model

### Site

Note, this could be static config.

`Site` properties:
- `_id` (string) - site identifier, hopefully URL-able (shortname)
- `name` (string) - site title
- `description` (string) - short description of site
- `admins` (array of string) - emails of site admins
- ??`favicon` - site favicon (encoded? url?)
- ?? site-specific template and CSS stuff (colours, images, etc.)

`Admin` properties:
- `email` (string)
- `password` (string) - suitably hashed
- `sessionkey` (string) - if current session active
- `sessionexpires` (Date) - when session expires

### Group

Within a single site there may be one or more `Group`s.
Each group has its own independent set of users, activities and content.
A group represens a single bounded set of related activities with the 
same set of users/students and admins/teachers. It could involve one 
school or many.
It is comparable to a Google "Class" or Moodle "Course".

Group IDs will be prefixed with the Site ID, e.g. "S1/G1".

`Group` properties:
- `_id` (string) - group/class identifier (shortname), prefixed with Site ID,
  unique within server, URLable
- `name` (string) - display name/title
- `description` (string) - short description
- `showpublic` (bool) - show on public Site
- `allowguest` (bool) - allow (stateless) keyless guest access
- `password` (string) - group joining password
- `requireinitials` (bool) - require user initials
- `requireemail` (string) - require email (not stored) to send usercode to
- `allowselfenrol` (bool) - allow self-enrolment
- `site` (object) - Site de-norm
- `rewards` (array) - array of `Reward`s - rewards available
- ?? something about user content organisation
- ?? group-specific admin

`Reward` properties:
- `_id` (string) - requard id, short name
- `icon` (string) - reward icon filename (default scope is site icons)
- `noicon` (string) - optional icon filename when you *don't* have it
- `comment` (string) - for admin/author

### User

A `User` is an end-user of a group, i.e. a student/class-member. 
Each user belongs to a specific `Group`.
Users are anonymous, and access control/identification is via a
user code generated for each User if/when they are for their progress
to be saved (or if signed up by the organisation).

`User` properties:
- `_id` (string) - PK, site/group/usercode
- `initials` (string) - if required
- ?? `pin` (string) - for security
- `groupid` (string) - user's site/group (FK)
- `group` (object) - group de-norm (filtered), name, guest, site
- `rewards` (array) - array of UserReward - probably only those the user has
  or that have an icon for not having
- `chats` (array) - array of `UserChat`, de-norm cache of top-level chat info
- `content` (array) - array of `UserContent`, user's personal content list
- `created` (Date)
- `lastmodified` (Date)

`UserReward`:
- `_id` (string) - reward id, short name
- `got` (bool)
- `icon` (string) - denorm from Reward, reward icon filename
  (default scope is site icons)
- `noicon` (string) - denorm from Reward, optional icon filename 
  when you *don't* have it

### Content

`Content`:
- `title` (string)
- `description` (string)
- `section` (string) - section title
- `sortorder` (number) - for sorting, low to high
- `type` (string) - one of `image`, `youtube`, `mp3`, `document`, `website`
- `url` (string)
- `hidden` (bool) - don't show in/add to content tab

?? other content types, e.g. multi-track or switchable audio.

`UserContent` extends `Content` with:
- `_id` (string) - unique, for detail view identification

### UserChat

One User's actual conversation in one Chat.

`UserChat`, collection "UserChat":
- `_id` (string) - PK, site/group/usercode/chat
- `chatdef` (object) - de-norm (partial?) ChatDef
- ?? `visible` (bool) - in master list
- `enabled` (bool) - disabled => locked
- `unread` (bool) - new content
- `waiting` (bool) - waiting for response
- `messages` (array) - array of UserMessage
- `nextix` (int) - index of current/next MessageDef

`UserMessage` (cf MessageDef):
- `userinput` (string) - user's input (optional)
- `message` (string) - message to user (optional)
- `content` (object) - `Content` (optional)
- `rewards` (array of string) - IDs of rewards given (optional)
- `date` (Date) - date/time added
- ?? new or seen

Note, elements present are displayed in the above order,
userinput then message then content then rewards.

### ChatDef and MessageDef

Definition of a Chat, Group-specific.

`ChatDef`, may be static:
- `_id` (string) - PK, site/group/chat
- `groupid` (string) - FK Group, i.e. site/group
- `ifall` (array of string) - rewards required to enable (and)
- `andnot` (array of string) - rewards that disable (and)
- `sortorder` (number) - for sorting
- `name` (string) - display name
- `description` (string) - description (on card)
- `icon` (string) - filename of icon/avatar, defaults to site icons dir
- `messages`(array) - array of MessageDef
- ?? visible controls

`MessageDef` (within ChatDef):
- `label` (string) - optional jump label

MessageDef trigger conditions:
- `ifall` (array of string) - rewards required to enable (and)
- `andnot` (array of string) - rewards that disable (and)
- `after` (number) - optional, second to wait before enabling
- `waitfor` (string) - user input to wait for (prompt)
- `ornext` (bool) - also check the next MessageDef
- ?? wait for teacher

MessageDef actions:
- `message` (string) - message to user
- `content` (object) - `Content`
- `rewards` (array of string) - IDs of rewards to give
- `reset` (array of string) - IDs of (usually hidden) rewards to remove
- `jumpto` (string) next label (default is next after ornext group)


