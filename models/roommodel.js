const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    user: {               // 欄位名稱
        type: String,     // 欄位資料型別
        required: true,   // 必須要有值
    }
});

module.exports = mongoose.model('RoomData', roomSchema);