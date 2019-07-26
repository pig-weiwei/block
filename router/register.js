var express = require('express');
var Message = require('../modules/db/message');
var Replay = require('../modules/db/replay');
var User = require('../modules/db/user');
var tools = require('../modules/tools');
var md5 = require('md5');
var router = express.Router()





//注册跳转接口   注册页面跳转
router.get('/register',function (req,res) {
    var error = req.flash('error').toString();
    var errorpas = req.flash('errorpas').toString();
    res.render('register.html',{error,errorpas})
})

//注册接口   注册页面信息存储
router.post('/register',function (req,res) {
    User.findOne({username:req.body.username},(err,data)=>{
        if (data){
            req.flash('error','登录名已经被注册')
            res.redirect('/register')
        }
        else{
            if (req.body.password == req.body.repassword) {
                req.body.password = md5(req.body.password)
                var user = new User(req.body);
                user.save(err=>{
                    res.redirect('/login')
                })
            }
            else{
                req.flash('errorpas','确认密码错误')
                res.redirect('/register')
            }
        }
    })
})


module.exports = router;
