var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

const Message = require('./models/message');

const User = require('./models/user');
require('dotenv').config()

const Room = require('./models/roommodel');
const { sendEvent, addRoomEvent } = require('./src/socket.io/socket.controllers/chat.controller');

var app = express();

app.use(express.urlencoded({ extended: true }));
const initRoutes = require("./src/routes");
initRoutes(app);

const server = require('http').Server(app);
const io = require('socket.io')(server);
const records = require('./record.js');

mongoose.connect(process.env.dbURI)
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

// 修改 connection 事件
io.on('connection', (socket) => {
    //使用者發送新文字訊息
    socket.on("send", (msg) => {
      sendEvent(io.sockets, msg);
    });

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
      addRoomEvent(io, socket, room);
  })
    socket.on("emit_msg", (msg) => {
      console.log("msg_emit",msg)
    })
   
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
