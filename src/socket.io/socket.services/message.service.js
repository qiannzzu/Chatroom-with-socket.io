const { EventEmitter } = require('events');

const Message = require('../../../models/message');

let instance;

class Records extends EventEmitter {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }

  async push(sockets, msg) {
    // 將聊天資料轉成資料模型
    const m = new Message(msg);
    // 存至資料庫
    m.save()
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
    console.log("msg",msg)
  }

  async get(room) {
    Message.find({'roomid':room}).sort({_id:-1}).limit(50) //id為具時間之排序 取最後50筆
        .then((result)=>{
          result = result.reverse()
          console.log("result.len", result.length)
          return result;
        })
        .catch((err)=>{
          console.log(err)
        })
  }
}

module.exports = (function () {
  if (!instance) {
    instance = new Records();
  }

  return instance;
})();
