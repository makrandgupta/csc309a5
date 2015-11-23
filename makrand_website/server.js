// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var morgan	 = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration



	// set up our express application
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	// app.use(bodyParser()); // get information from html forms
	app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(session({ 
		secret: 'ilovescotchscotchyscotchscotch',
		resave: true,
		saveUninitialized: true
	})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname + '/'));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
