var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var Post = require('./models/post.js');

var app = express();

// 数据库
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
	secret : settings.cookieSecret,
	cookie : {maxAge : 3600000},
	store : new MongoStore({ // 持久化到数据库中
        db : settings.db,
        host: settings.host,
        port: settings.port
	}),
	resave : true,
	saveUninitialized : true, //需要显性的设置== 用户不管是否登陆网站，只要要登陆就会生成一个空的session
    rolling: true // 更新过期时间
}));
// app.use(session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: false }));
app.post('/delete', function (request, response) {
    // 使用body-parser
    Post.remove({id: request.body.id}, function(err, result) {
        response.end(JSON.stringify({status: 200}));
    });

    // 不使用body-parser中间件
    // response.setHeader('Content-Type','text/html');
    // var data = '';
    // request.on('data', function(chunk){    
    //     data += chunk;
    // });
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    // request.on('end', function(error){    
        // Post.remove({id: data.split('=')[1]}, function(err, result) {
        //     console.log(err, '=====', result);
        //     response.end({status: 200});
        // })
    // });
})


indexRouter(app);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// handle for mongodb
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
