var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require("fs");

const Message = require('./models/message');

const User = require('./models/user');

const Room = require('./models/roommodel');

var app = express();

app.use(express.urlencoded({ extended: true }));
const initRoutes = require("./src/routes");
initRoutes(app);

const server = require('http').Server(app);
const io = require('socket.io')(server);
const records = require('./record.js');

const dbURI = 'mongodb+srv://Reni:reni891016@cluster0.vkeuzty.mongodb.net/carpool?retryWrites=true&w=majority'
mongoose.connect(dbURI)
  .then((result)=>console.log("connect"))
  .catch((err)=>console.log(err))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//mongoose and mongo sandbox routes


app.get('/', (req, res) => {
  res.render("chatroom.ejs");
});

app.get('/chatroom/?roomid', (req, res) => {
  res.render("chatroom.ejs",{roomid:req.params.roomid});
});


app.get('/all-users',(req,res)=>{
  User.find()
    .then((result)=>{
      res.send(result);
    })
    .catch((err)=>{
      console.log(err)
    })
})
//add user
app.post('/users',(req,res)=>{
  console.log(req.body)
  const user = new User(req.body);
  user.save()
    .then((result)=>{
      res.send(result)
    })
    .catch((err)=>{
      console.log(err)
    })
  

})

//create and get roomid
app.post('/room',(req,res)=>{
  console.log(req.body)
  Room.findOne({
    user:req.body.user // 若已存在該room, 則回傳roomid, 不存在則新增一room
  }).then((result)=>{
    if(result){
      res.send(result["_id"]);
    }else{
      const room = new Room(req.body);
      room.save()
        .then((result)=>{
          res.send(result["_id"]) //回傳roomid
        })
        .catch((err)=>{
          console.log(err)
        })
    }
  })
  .catch((err)=>{
    console.log("err",err)
  })
})

app.get('/getchatrecord/:roomid',(req,res)=>{
  Message.find({'roomid':req.params.roomid}).sort({_id:-1}).limit(50) //id為具時間之排序 取最後50筆
  .then((result)=>{
    console.log(result)
    result = result.reverse();
    res.send(result);
  })
  .catch((err)=>{
    console.log(err)
  })
})

//user login
app.post('/login',(req,res)=>{
  User.findOne({
    mail: req.body.mail
  }).exec((err, user)=>{
    if(err){
      res.status(500).send({ message: err });
      return;
    }
    if(!user){
      res.status(404).send({ message: "User Not found." });
      return;
    }
    var passwordIsValid = req.body.password===user.password
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }
    res.status(200).send({
      text:"success",
      _id: user._id,
      mail: user.mail,
      __v: user.__v
    })
  })

})

// 修改 connection 事件
io.on('connection', (socket) => {
    //使用者發送新文字訊息
    socket.on("send", (msg) => {
      console.log("msg",msg)
      records.push(msg);
    });

    // records.get((msgs) => {
    //     socket.emit("chatRecord", msgs);
    // });
    socket.on('getrecord',room => {
      Message.find({'roomid':room}).sort({_id:-1}).limit(50) //id為具時間之排序 取最後50筆
        .then((result)=>{
          result = result.reverse()
          socket.emit("chatRecord", result);
        })
        .catch((err)=>{
          console.log(err)
        })
    })
    socket.on('addRoom', room => {
      socket.join(room)
      console.log(room)
      // //(1)發送給在同一個 room 中除了自己外的 Client
      // socket.to(room).emit('addRoom', '已有新人加入聊天室！'+room)
      //(2)發送給在 room 中所有的 Client
      io.sockets.in(room).emit('addRoom',room)
  })
   
});
// Records 的事件監聽器(新增訊息成功 回傳至前端訊息內容)
records.on("new_message", (msg) => {
  // 廣播訊息到聊天室
  console.log("rmid",msg.roomid)
  io.sockets.in(msg.roomid).emit('msg',msg)
  // io.emit("msg", msg);
});


server.listen(3000, () => {
  console.log("Server Started. http://localhost:3000");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
