const {EventEmitter} = require("events");

const Message = require('./models/message');
 
let instance;
 
class Records extends EventEmitter {
    constructor () {
        super();
    }
 
    push (msg) {
        // 將聊天資料轉成資料模型
        const m = new Message(msg);
        // 存至資料庫
        m.save()
        .then((result)=>{
            console.log(result)
          })
        .catch((err)=>{
          console.log(err)
        });
        this.emit("new_message", msg);
        
    }
 
    get (callback) {
        // 取出所有資料
        Message.find((err, msgs) => {
            if(callback){
                callback(msgs);
            }
        });
    }
     
}
 
module.exports = (function () {
    if (!instance) {
        instance = new Records();
    }
 
    return instance;
})();
 