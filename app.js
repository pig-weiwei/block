var express = require('express');
var app = express();
var Message = require('./modules/db/message');
var Replay = require('./modules/db/replay');
var User = require('./modules/db/user');
var tools = require('./modules/tools');
var path = require('path');



//connect-flash  会话闪存模式，flash相当于一个暂存器，暂存器里面的内容使用过一次便被清空，适合做网站的提示信息
var flash = require('connect-flash');
app.use(flash())


// md5 是一种加密算法。能够对一段数据进行加密，加密之后得到一段 32 位长度的16进制的数字，md5加密是不可逆的
var md5 = require('md5');

//express-session  会话模块，是基于express专门处理session的模块，把会话数据保存在服务器上，默认存储在内存中，会话标识（非会话数据）保存在cookie中
var session = require('express-session')

//connect-mongo 程序运行时，app对象会自动替我们管理session的存储，更新，删除
//会把session存储到mongoDB数据库里
var MongoStore = require('connect-mongo')(session);



app.use(express.static('public'));
app.engine('html',require('express-art-template'));
app.use(express.urlencoded({extended:false}));

//使用use挂载express-session之后，会自动生成http请求session对象，保存在req.session中
// ，在登录注册时通过req.session来存储和访问会话数据
app.use(session({
//    添加配置信息
    secret:'myLogin',
    resave:true,
    saveUninitialized:true,
    rolling:true,
    cookie:{
        maxAge:1000*60*60
    },
    store: new MongoStore({
        url:'mongodb://127.0.0.1:27017/studentDB'
    })
}))



//注册模块路由导入
var registerRouter = require('./router/register')
app.use(registerRouter);



//登录模块路由导入
var loginRouter = require('./router/login')
app.use(loginRouter);



//博客模块路由导入
var blockRouter = require('./router/block')
app.use(blockRouter);





app.listen(3000,function () {
    console.log('run-----------------')
});