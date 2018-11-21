/*
* @Author: Administrator
* @Date:   2018-11-16 11:52:23
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-21 17:59:27
*/

'use strict';
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');
var Post = require('../models/post.js');


function checkLogin(req, res, next) {
	if (!req.session.user) {
		// req.flash('error', '未登录!'); 
		// res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		// req.flash('error', '已登录!'); 
		// res.redirect('back');//返回之前的页面
	}
	next();
}

var appHelper = function (app) {
	app.post('/', function (request, response) {
		var token = request.body.token;
		var name = null;
		if (token) {      
	        // 解码 token (验证 secret 和检查有效期（exp）)
	        jwt.verify(token, 'secret', function(err, decoded) {    
	            if (!err) {
	               	name = decoded.name;
	        	}
	        });
	    };

	  	Post.get(name, function (err, posts) {
		    if (err) {
		    	posts = [];
		    }
		    response.end(JSON.stringify({
		    	isLogin: !!name,
		    	title: 'Home',
		    	user: request.session.user,
		    	posts: posts
		    	// success: request.flash('success').toString(),
		    	// error: request.flash('error').toString()
		    }));
  		});
	});

	// app.post('/login', checkNotLogin);
	app.post('/login', function (request, response) {
		//生成密码的 md5 值
		var md5 = crypto.createHash('md5'),
		  password = md5.update(request.body.password).digest('hex');
		//检查用户是否存在
		User.get(request.body.name, function (err, user) {
			var responseData = {};
			if (!user) {
				responseData={msg: '用户不存在!'};
			} else if (user.password != password) {
				responseData={msg: '密码错误!'};
			} else {
				// request.session.user = user;
				responseData = {
					msg: '登陆成功！',
			    	token: jwt.sign(user, 'secret', {
			            expiresIn: 3600 * 1000
			        })
			    };
			}
			response.end(JSON.stringify(responseData));
		});
	});

	app.post('/register', function(req, response, next) {
		var name = req.body.name,
		  password = req.body.password,
		  password_re = req.body['password-repeat'];
		var responseData = {};
		//检验用户两次输入的密码是否一致
		if (password_re != password) {
			responseData = {msg: '两次输入的密码不一致!'};
			response.end(JSON.stringify(responseData));
		} else {
			//生成密码的 md5 值
			var md5 = crypto.createHash('md5'),
				password = md5.update(req.body.password).digest('hex');
			var param = {
					name: name,
					password: password,
					email: req.body.email
				}
			var newUser = new User(param);
			//检查用户名是否已经存在 
			User.get(newUser.name, function (err, user) {
				if (err) {
					responseData = {msg: err};
					response.end(JSON.stringify(responseData));
				} else if (user) {
					console.log('用户已存在')
					responseData = {'msg': '用户已存在!'};
					response.end(JSON.stringify(responseData));
				} else {
					//如果不存在则新增用户
					newUser.save(function (err, user) {
						if (err) {
							responseData = {msg: err};
						} else {
							// req.session.user = newUser;//用户信息存入 session
							responseData = {
								msg: '注册成功!',
						    	token: jwt.sign(param, 'secret', {
						            expiresIn: 3600 * 1000
						        })
						    };
						};

						response.end(JSON.stringify(responseData));
					});
				};
			});
		}
		
	});

	app.post('/post', function (request, response) {
		var token = request.body.token;
		var responseData = {};
		if (token) {   
	        // 解码 token (验证 secret 和检查有效期（exp）)
	        jwt.verify(token, 'secret', function(err, decoded) {    
	            if (!err) {
				    var post = new Post(decoded.name, request.body.title, request.body.post);
					post.save(function (error) {
					    if (err) {
					    	responseData = {msg: error};
					    }
				    	responseData = {'msg': '发布成功!'};
				    	response.end(JSON.stringify(responseData));
				  	});
	        	} else {
	        		responseData = {msg: err};
	        		response.end(JSON.stringify(responseData));
	        	}
	        });
	    } else {
	    	responseData = {msg: '重新登陆！'};
	    	response.end(JSON.stringify(responseData));
	    }
	});

	app.post('/del', function (request, response) {
	    // 使用body-parser
	    Post.remove({id: request.body.id}, function(err, result) {
	        response.end(JSON.stringify({status: 200}));
	    });
	})
};

module.exports = appHelper;
