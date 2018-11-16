/*
* @Author: Administrator
* @Date:   2018-11-16 10:56:10
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-16 17:27:15
*/

'use strict';

var blog = {
	initalData: function () {
		return {
			title: this.getElement('header>h1', true),
			article: this.getElement('article', true),
			login: '<div id="submitLogin">' +
					'用户名：<input type="text" name="name"/><br />' +
					'密码：  <input type="password" name="password"/><br />' +
				     '<input type="submit" id="loginBtn" value="登录"/>' +
				'</div>',
			register: '<form method="post">' +
					'用户名：  <input type="text" name="name"/><br />' +
					'密码：    <input type="password" name="password"/><br />' +
					'确认密码：<input type="password" name="password-repeat"/><br />' +
					'邮箱：    <input type="email" name="email"/><br />' +
				    '<input type="submit" value="注册"/>' +
				'</form>'
		}
	},
	init: function () {
		this.data = this.initalData();
		this.getUserInfo();
		this.handleRouterEvent();
	},
	getElement: function (val, isSingle) {
		var typeSign = val.slice(0,1);
		var elements = [];
		if (typeSign === '.') {
			elements = document.getElementsByClassName(val.slice(1));
		} else if (typeSign === '#') {
			return document.getElementById(val.slice(1));
		}
		elements = document.querySelectorAll(val);

		return isSingle ? elements[0] : elements;
	},
	handleAjax: function (type, url, data, success, error) {
		//  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
		var xmlhttp = xmlhttp=new XMLHttpRequest();
		
		xmlhttp.onreadystatechange = function(event) {
			var response = event.target.response;
			try{
				if (xmlhttp.readyState==4) {
					if (xmlhttp.status == 200) {
						success && success(response);
					} else {
						error && error(response)
					}
				}
			} catch(err) {
				error && error(err);
			}
		}
		url = 'http://localhost:3000' + url;
		xmlhttp.open(type, url, true);
		type === 'POST' && xmlhttp.setRequestHeader('content-type','application/x-www-form-urlencoded');
		xmlhttp.send(data);
	},
	getArticle: function (post, isLogin) {
		var article = '<div>' +
			'<p><h2>' + post.title + '</h2></p>' +
			'<p class="info"> '+
				'作者：<a href="#">' + post.name + '</a> |' +
				'日期：' + post.time.minute;
		if (isLogin) {
			article += '<span href="#" onClick="deleteData(event, post.id)">delete</span>' +
				'<a>modify</a>';
		}	
		article += '</p>' +
			'<p>' + post.post + '</p>' +
			'</div>';
		return article;
	},
	getAllArticles: function (data) {
		var posts = data.posts;
		var _this = this;
		var articles = '';
		if(posts && posts.length) {
			posts.forEach(function(item) {
				articles += _this.getArticle(item, data.isLogin);
			});
			_this.data.article.innerHTML = articles;
		} else {
			_this.data.article.appendChild('<p>' + data.title + '</p>');
		}
	},
	updateNav: function (isLogin) {
		var loginedEle = this.getElement('.logined');
		var unloginEle = this.getElement('.unlogin');
		if (isLogin) {
			unloginEle.forEach(function(item){item.style.display = 'none'});
			loginedEle.forEach(function(item){item.style.display = 'inline-block'});
		} else {
			unloginEle.forEach(function(item){item.style.display = 'inline-block'});
			loginedEle.forEach(function(item){item.style.display = 'none'});
		}
	},
	getUserInfo: function () {
		var _this = this;
		this.handleAjax('GET', '/', '', function(response) {
			const data = JSON.parse(response);
			console.log(data,  'success');
			_this.data.title.innerText = data.title;

			_this.getAllArticles(data);
			_this.updateNav(data.isLogin);
		}, function (error) {
			console.log(error, 'error');
		});
	},
	logOut: function () {
		_this.handleAjax('GET', '/' + title, '', function(response) {
			console.log(response, 'success');
		}, function (error) {
			console.log(error, 'error');
		});
	},
	handleRouterEvent: function () {
		var tabs = this.getElement('nav>span');
		var _this = this;
		tabs.forEach(function(item){
			item.addEventListener('click', function(event) {
				var title = this.children[0].title;
				if (_this.data[title]) {
					_this.data.article.innerHTML=_this.data[title];
					_this.submitLogin();
					return;
				} else if (title === 'logout') {
					_this.logOut();
				} else if (title === 'home') {
					_this.getUserInfo();
				}
			});
		});
	},
	submitLogin: function () {
		var loginForm = this.getElement('#submitLogin');
		var loginSublit = this.getElement('#loginBtn');
		var _this = this;
		loginSublit.addEventListener('click', function(event) {
			var formData = '';
			for(var i=0; i < loginForm.children.length; i++) {
				var item = loginForm.children[i];
				if (item.name) {
					if (i) {
						formData += '&'
					}
					formData += item.name + '=' + item.value;
				}
			}
			console.log(formData);
			_this.handleAjax('POST', '/login', formData, function(response) {
				console.log(response, 'success');
				_this.getUserInfo();
			}, function (error) {
				console.log(error, 'error');
			});
		})
	}

};

blog.init();
