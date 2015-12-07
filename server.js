'use strict';

// Imports. -------------------------------------------------------------------

var express = require('express');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var morgan = require('morgan');
var passport = require('passport');
var connectFlash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Config. --------------------------------------------------------------------

// Connect to the database.
mongoose.connect('mongodb://csc309a5:csc309a5@ds061474.mongolab.com:61474/csc309a5');

// Configure passport.
require('./app/passport')(passport); // pass passport for configuration

// App setup. -----------------------------------------------------------------

var app = express();

// Set template engine.
app.set('view engine', 'ejs');

// Use various middleware.
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for authentication)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressSession({ // required for passport
    secret: 'ilovescotchscotchyscotchscotch',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(connectFlash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname + '/'));

// Load app routes.
require('./app/routes.js')(app, passport);

// Launch the app.
app.listen(3000);
console.log('The magic happens on port ' + 3000);
