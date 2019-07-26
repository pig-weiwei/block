// 负责创建表 及 表的操作模型
var mongoose = require('./connection');


var msgSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    introduction:String,
    headerPic:String
});

var User = mongoose.model('user',msgSchema);


module.exports = User;
