var express = require('express');
var Message = require('../modules/db/message');
var Replay = require('../modules/db/replay');
var User = require('../modules/db/user');
var tools = require('../modules/tools');
var md5 = require('md5');
var router = express.Router()



//登录跳转接口   登录页面跳转
router.get('/login',function (req,res) {
    var error = req.flash('error').toString();
    var errorpas = req.flash('errorpas').toString();
    res.render('login.html',{error,errorpas})
})

//登录接口   注册页面信息存储
router.post('/login',function (req,res) {
    User.findOne({username:req.body.username},(err,data)=>{
        if (!data){
            req.flash('error','用户名不存在')
            res.redirect('/login')
        }
        else{
            if (data.password == md5(req.body.password)) {
                req.session.user = data;
                res.redirect('/')
            }
            else{
                resq.flash('errorpas','密码输入错误')
                res.redirect('/login')
            }
        }
    })
})


//退出登录接口
router.get('/logout',(req,res)=>{
    req.session.user = null;
    res.redirect('/');
})



module.exports = router;