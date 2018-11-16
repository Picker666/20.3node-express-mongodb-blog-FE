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
var appHelper = require('./models/appHelper.js');

var app = express();

// 数据库
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.set('trust proxy', 1) // trust first proxy
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

app.use(bodyParser.urlencoded({ extended: false }));
appHelper(app);
// indexRouter(app);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

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
