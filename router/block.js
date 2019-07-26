var express = require('express');
var Message = require('../modules/db/message');
var Replay = require('../modules/db/replay');
var User = require('../modules/db/user');
var tools = require('../modules/tools');
var router = express.Router()
var multer = require('multer');
var fs = require('fs');



//主页接口
router.get('/',function (req,res) {
    var page = (req.query.page || 1)*1;
    var showCount = 5;
    Message.find({},(err,msgs)=>{
        if (err){
            res.send('首页查询失败')
        }
        else{
            console.log('-------------首页刷新-----------')
            var msgs =JSON.parse(JSON.stringify(msgs));
            Message.countDocuments((err,counts)=>{
                var allpage = Math.ceil(counts/showCount);
                res.render('index.html',{msgs,user:req.session.user,page,allpage});
            })

        }
    }).populate('author').populate('replay').skip((page-1)*showCount).limit(showCount).sort({_id:-1});
})










//用户注册详细信息详细信息
router.get('/userinfo/:username',(req,res)=>{
    // res.send(req.params.username)
    User.findOne({username:req.params.username},(err,data)=>{
        if(err){
            res.send('信息查询模块失效')
        }
        else{
            res.render('userinfo.html',{data,user:req.session.user})
        }
    })
})




//进入信息编辑页面
router.get('/userinfochange/:_id',(req,res)=>{
    User.findOne({_id:req.params._id},(err,userinfochange)=>{
        if(err){
            res.send('信息查询模块失效')
        }
        else{
            res.render('userinfochange.html',{userinfochange,user:req.session.user})
        }
    })
})


//编辑的信息上传
router.post('/userinfochange/:_id',(req,res)=>{
    User.updateOne({_id:req.params._id},{
        introduction:req.body.introduction,
        email:req.body.email
    },(err,data)=>{
        console.log(req.body)
        res.redirect('/')
    })
})


//头像编辑界面
router.get('/headerPic/:_id',(req,res)=>{
    User.findOne({_id:req.params._id},(err,userinfochange)=>{
        if(err){
            res.send('信息查询模块失效')
        }
        else{
            res.render('headerPic.html',{userinfochange,user:req.session.user})
        }
    })
})





//更改头像操作
var uploadpath = './public/imgs/';
var headername;

var stroage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,uploadpath);
    },
    filename:function (req,file,cb) {
        console.log('文件命名---------------------------');
        console.log(file);
        var arr = file.originalname.split('.');
        var ext = arr[arr.length-1];
        headername = req.session.user.username+'-'+Date.now()+'.'+ext;
        console.log(headername);
        cb(null,headername)
    }
});


var upload = multer({
    storage:stroage,
})


router.post('/headerPic/:_id',upload.single('headerPic'),(req,res)=>{
    console.log('=====================================');
    console.log('旧头像：'+req.session.user.headerPic);
    var headerurl = '/imgs/'+headername;
    console.log('新头像：'+headerurl);
    if (fs.existsSync(uploadpath+headername)) {
        User.findOne({_id:req.session.user._id},(err,user)=>{
            if (user.headerPic != '/pic/timg.jpg') {
                fs.unlinkSync('./public'+user.headerPic);
            }
            user.headerPic = headerurl;
            user.save(()=>{
                req.session.user.headerPic = headerurl;
                res.redirect('/')
            });
        });
    } else {
        res.send('上传失败');
    }
})










//发布的接口
router.get('/release',(req,res)=>{
    if (req.session.user){
        res.render('release.html',{user:req.session.user})
    }
    else{
        res.redirect('/login')
    }
})

//发布消息的存储接口
router.post('/release',(req,res)=>{
    var m = new Message({
        title:req.body.title,
        msg:req.body.msg,
        author:req.session.user._id,
        time:{
            second:tools.dateFormat(new Date()),
            year:(new Date()).getFullYear()
        },
        readCount:0,
        lab:req.body.lab,
        replay:[]
    })
    m.save(err=>{
        if (err) {
            res.send('消息发布失败');
        } else {
            res.redirect('/');
        }
    });
})



//用户发帖列表
router.get('/search/msglist/:_id',(req,res)=>{
    // res.send(req.params._id);
    var page = (req.query.page || 1)*1;
    var showCount = 5;
    Message.find({author:req.params._id},(err,msglist)=>{
        if (err) {
            res.send('用户列表查找失败');
        } else {
            console.log(msglist);
            var msglist =JSON.parse(JSON.stringify(msglist));
            Message.countDocuments({author:req.params._id},(err,counts)=>{
                var allpage = Math.ceil(counts/showCount);
                res.render('msglist.html',{msglist,user:req.session.user,page,allpage});
            })

        }
    }).populate('author').skip((page-1)*showCount).limit(showCount).sort({_id:-1});
})





//博客详情展示接口
router.get('/details/:_id',(req,res)=>{
    Message.find({_id:req.params._id},(err,details)=>{
        if (err){
            res.send('博客详情展示失败')
        }
        else{
            console.log(details[0].readCount);
            Message.updateOne({_id:req.params._id},{
                readCount:details[0].readCount+1
            },(err,data)=>{

            })
            var details =JSON.parse(JSON.stringify(details));
            res.render('details.html',{details,user:req.session.user})
        }
    }).populate('author').populate('replay');
})


//回复的存储接口
router.post('/replay/:_id',(req,res)=>{
    var r = new Replay({
        time:tools.dateFormat(new Date()),
        content:req.body.content,
        username:req.session.user.username,
        userId:req.session.user._id
    })
    r.save((err,data)=>{
        if (err){
            res.send('回复存储失败')
        }
        else{
            Message.findOne({_id:req.params._id},(err,msg)=>{
                msg.replay.push(data._id);
                msg.save((err)=>{
                    if (err) {
                        res.send('留言失败');
                    } else {
                        res.redirect('/details/'+req.params._id)
                    }
                })
            })
        }
    })
})


router.get('/change/:_id',(req,res)=>{
    Message.find({_id:req.params._id},(err,changeData)=>{
        var changeData = JSON.parse(JSON.stringify(changeData))
        res.render('change.html',{changeData})
    })
})


//编辑接口
router.post('/change/:_id',(req,res)=>{
    Message.updateOne({_id:req.params._id},{
        msg:req.body.msg
    },(err,data)=>{
        res.redirect('/details/'+req.params._id)
    })
})


//删除模块接口
router.get('/delete/:_id',(req,res)=>{
    Message.deleteOne({_id:req.params._id},err=>{
        console.log('删除成功')
        res.redirect('/')
    })
})





//存档  年份展示
router.get('/saveFile',(req,res)=>{
    Message.find({},(err,msglist)=>{
        if (err) {
            res.send('用户列表查找失败');
        } else {
            var saveFile =JSON.parse(JSON.stringify(msglist));
            res.render('SaveFile.html',{saveFile,user:req.session.user});
        }
    }).populate('author').sort({_id:-1});
})



//首页标签展示列表
router.get('/search/lab/:lab',(req,res)=>{
    Message.find({lab:req.params.lab},(err,lablist)=>{
        var lablist =JSON.parse(JSON.stringify(lablist));
        var labname = req.params.lab;
        res.render('lab.html',{lablist,user:req.session.user,labname:labname});
    })
})


//上层导航栏标签   去重 去空 导航
router.get('/label',(req,res)=>{
    var lb = [];
    Message.find({},(err,lbdata)=>{
        for (var i=0;i<lbdata.length;i++){
            for (var j=0;j<3;j++){
                lb.push(lbdata[i].lab[j])
            }
        }
        var lb1 =Array.from( new Set(lb)).filter(d=>d);
        console.log(lb1);
        res.render('label.html',{lb1})
    })
})


//左侧搜索栏
router.post('/search',(req,res)=>{

    Message.find({
        $or:[
            {title:{$regex:req.body.keyboard,$options:'$i'}},
            {msg:{$regex:req.body.keyboard,$options:'$i'}},
            {lab:{$regex:req.body.keyboard,$options:'$i'}}
        ]
    },(err,searchData)=>{
        if (searchData != '') {
            var searchname = req.body.keyboard;
            var searchData = JSON.parse(JSON.stringify(searchData))
            console.log(searchData)
            res.render('search.html',{searchData,searchname:searchname,user:req.session.user})
        }
        else{
            res.render('error.html')
        }
    })
})




module.exports = router;