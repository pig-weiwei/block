// 负责创建表 及 表的操作模型
var mongoose = require('./connection');


var msgSchema = new mongoose.Schema({
    title:String,
    msg:String,
    time:Object,
    lab:Array,
    readCount:Number,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    replay:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'replay'
    }]
});

var Message = mongoose.model('msg',msgSchema);


module.exports = Message;
