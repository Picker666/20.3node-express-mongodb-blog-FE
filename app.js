var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var flash = require('connect-flash');
var expressJWT = require('express-jwt');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var Post = require('./models/post.js');
var appHelper = require('./models/appHelper.js');

var app = express();

// 数据库
// var settings = require('./settings');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// 设置跨域访问
app.all('*', function(req, res, next) {
    // console.log(req.headers.origin);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", true); //带cookies
    // res.header("X-Powered-By", ' 3.2.1')
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else if (req.method == 'GET') {
        // req.body = req.query;
        next();
    } else {
        next();
    }
})

app.use(cookieParser('sessiontest'));
var redis = require('./models/redis.js').redis;
// handle for mongodb
app.use(session({
    secret: 'sessiontest',
    cookie: {maxAge: 1000 * 60 * 60 * 30},//30 days
    store: new RedisStore({
        client: redis,
        prefix: 'hgk'
    }),
    resave: true,
    rolling:true,
    saveUninitialized : true, //需要显性的设置== 用户不管是否登陆网站，只要要登陆就会生成一个空的session
}));

// var secretOrPrivateKey = "hello  BigManing"  //加密token 校验token时要使用
// app.use(expressJWT({
//     secret: secretOrPrivateKey   
// }).unless({
//     path: []  //除了这个地址，其他的URL都需要验证
// }));
// app.use(function (err, req, res, next) {
//   if (err.name === 'UnauthorizedError') {   
//       //  这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
//     res.status(401).send('invalid token...');
//   }
// });
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
