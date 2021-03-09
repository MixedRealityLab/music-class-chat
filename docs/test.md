# test (data)

note, uses database 'music-class-chat'.

```
sudo docker exec -it vagrant_mongo_1 mongo
```
then
```
use music-class-chat
db.Sites.insertOne({
  _id: "test", name: "Test Site", description: "Test and development only",
  admins:[{ email: "chris.greenhalgh@nottingham.ac.uk", password: "",
  enabled: true }]
});
db.Groups.insertOne({
  _id: "test/test1", name: "Test Group 1", description: "hand made test 1",
  showpublic: true, requireinitials: true, requirepin: false, 
  requireemail: false, allowselfenrol: true, password: "please", 
  allowguest: true, rewards: [], 
  site:{_id:"test", name: "Test Site", 
  description: "Test and development only",
  admins:[{ email: "chris.greenhalgh@nottingham.ac.uk", password: "",
  enabled: true }]}
});
```

try
- test group home: http://localhost:3000/test/g/test1/
- update group form: http://localhost:3000/test/admin/aaa/g/test1/update - use example config spreadsheet
- user start form: http://localhost:3000/test/g/test1/signup (password: '1234') - note the userid, e.g. '4ec3d54fc23e17ff232a731a' if you want to return




