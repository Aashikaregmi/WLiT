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


const User = require('./models/users');

app.use(async (req, res, next) => {
  // Set mock user ID if not set
  if (!req.session.userId) {
    req.session.userId = '683553e54d31562ec4620f48'; // your test/mock user ObjectId
  }

  try {
    // Fetch full user document with populated buses
    const user = await User.findById(req.session.userId).populate('buses.bus');
    if (!user) {
      return res.status(401).send("Mock user not found");
    }
    req.user = user;
    res.locals.user = user; // makes user accessible in EJS templates
    next();
  } catch (error) {
    console.error("User fetch error:", error);
    next(error);
  }
});


app.use((req, res, next) => {
  res.locals.currentUrl = req.originalUrl;
  next();
});



app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const busesRouter = require('./routes/buses');
// const pagesRouter = require('./routes/pages');



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
// app.use('/pages', pagesRouter);

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
