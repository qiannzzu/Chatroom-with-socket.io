const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_token: String,
    mail: String,
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User',userSchema);
module.exports = User;