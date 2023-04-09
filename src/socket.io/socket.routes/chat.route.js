/* eslint-disable no-console */
const chatController = require('../socket.controllers/chat.controller');
const records = require('../socket.services/message.service');

const chatIo = (io) => {
  io.of('/chat').on('connection', (socket) => {
    // 使用者發送新文字訊息
    socket.on('send', (msg) => {
      chatController.sendEvent(io, socket, msg);
    });
    socket.on('addRoom', (room) => {
      chatController.addRoomEvent(io, socket, room);
    });
    records.on('new-message', (msg) => {
      // 資料庫儲存後由records class call該function以廣播訊息到特定room聊天室
      console.log('rmid', msg.roomid);
      io.sockets.in(msg.roomid).emit('msg', msg);
    });
  });
};

module.exports = chatIo;
