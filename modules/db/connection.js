
//创建数据库
var mongoose = require('mongoose');



//连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/studentDB',{useNewUrlParser:true},(err)=>{
    if (err){
        console.log('数据库连接失败')
    }
    else {
        console.log('数据库连接成功')
    }
})

module.exports = mongoose;