/* eslint-disable no-console */
const records = require('../socket.services/message.service');
var express = require('express');
var app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


const sendEvent = async (sockets, msg) => {
  await records.push(sockets, msg);
  sockets.in(msg.roomid).emit("msg", msg)
};

const addRoomEvent = (io, socket, room) => {
  socket.join(room);
  // 發送給在同一個 room 中的所有 Client（包含自己）
  io.sockets.in(room).emit('msg',{name: "server", msg: "someone join"})
};

module.exports = {
  sendEvent,
  addRoomEvent
};
