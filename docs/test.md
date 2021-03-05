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

try http://localhost:3000/test/g/test1/

