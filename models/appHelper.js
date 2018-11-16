/*
* @Author: Administrator
* @Date:   2018-11-16 11:52:23
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-16 17:36:29
*/

'use strict';
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');


function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登录!'); 
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登录!'); 
		res.redirect('back');//返回之前的页面
	}
	next();
}

function writeHead (status, response) {
	response.writeHead(200, { "Content-Type":"text/html" ,
		"Access-Control-Allow-Origin":"*" ,
		"Access-Control-Allow-Headers":"X-Requested-With"
	});
}

var appHelper = function (app) {
	app.get('/', function (request, response) {
		var name = null;
		if (request.session.user) {
			name = request.session.user.name;
		}
		console.log('=======', request.session, 'name======')
	  	Post.get(name, function (err, posts) {
		    if (err) {
		    	posts = [];
		    }
		    writeHead(200, response);
		    response.end(JSON.stringify({
		    	isLogin: !!name,
		    	title: 'Home',
		    	user: request.session.user,
		    	posts: posts,
		    	success: request.flash('success').toString(),
		    	error: request.flash('error').toString()
		    }));
  		});
	});

	// app.post('/login', checkNotLogin);
	app.post('/login', function (request, response) {
		//生成密码的 md5 值
		console.log(request.body, '============');
		var md5 = crypto.createHash('md5'),
		  password = md5.update(request.body.password).digest('hex');
		//检查用户是否存在
		User.get(request.body.name, function (err, user) {
			writeHead(200, response);
			var responseData = {};
			if (!user) {
				responseData={error: '用户不存在!'};
			} else if (user.password != password) {
				responseData={error: '密码错误!'};
			} else {	
				//用户名密码都匹配后，将用户信息存入 session
				responseData={success: '登陆成功！'}
				request.session.user = user;
			}
			console.log(responseData, '===========', request.session);
			response.end(JSON.stringify(responseData));
		});
	});

	app.post('/delete', function (request, response) {
	    // 使用body-parser
	    Post.remove({id: request.body.id}, function(err, result) {
	        response.end(JSON.stringify({status: 200}));
	    });
	})
};

module.exports = appHelper;
