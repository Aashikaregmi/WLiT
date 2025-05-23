var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var app = express();

const session = require('express-session');



app.use(session({
  secret: 'yourSecretKey',  // change to something secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set secure:true if using HTTPS
}));
app.use((req, res, next) => {
  // Mock a logged-in user by setting session userId manually
  if (!req.session.userId) {
    req.session.userId = '68306f5d9f7d772cd76e7ea9'; // Replace with a valid User ObjectId from your DB
  }
  next();
});


app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const busesRouter = require('./routes/buses');

mongoose.connect('mongodb+srv://aashikaregmi1234:fZTybGcEwmJiaJ0e@pokhara-bus-routes.l00ffuc.mongodb.net/?retryWrites=true&w=majority&appName=Pokhara-Bus-Routes')
.then(()=> console.log('Connected!!'))
.catch((err)=>console.error("error connecting", err))



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/buses', busesRouter);

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
