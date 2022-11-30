const { resolveObjectURL } = require('buffer');
const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    name: {               // 欄位名稱
        type: String,     // 欄位資料型別
        required: true,   // 必須要有值
    },
    type:{
        type: String,
        required: false,
    },
    msg: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: false
    },
    imagedata:{
        type: String,
        required: false
    },
    roomid:{
        type:String,
        required:false
    }
});

module.exports = mongoose.model('Messages', messagesSchema);