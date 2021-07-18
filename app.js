var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let passport = require("passport")
const bodyParser = require("body-parser")

let session = require("express-session")
const flash = require("connect-flash");

require("./passport-setup")(passport)
var index = require('./routes/index');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({limit: "50mb"}));

app.use(bodyParser.urlencoded({ extended: true,  
    parameterLimit: 100000,
    limit: '50mb', }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by')

app.use(session({ secret: 'applicaion', cookie: { httpOnly: false }, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session())

app.use('/', index);
app.use('/api', api);

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

app.listen(3400, () => console.log("app running"))