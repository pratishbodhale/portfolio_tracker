var express = require('express');
var app = express();
var logger = require('morgan');
const bodyParser = require("body-parser");
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var tradeRouter = require('./routes/trade');

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/trade', tradeRouter);

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
