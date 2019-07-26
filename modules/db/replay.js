// 负责创建表 及 表的操作模型
var mongoose = require('./connection');


var msgSchema = new mongoose.Schema({
    username:String,
    userId:String,
    content:String,
    time:String,
});

var Replay = mongoose.model('replay',msgSchema);


module.exports = Replay;