// REQUIRE STATEMENTS

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require("path");
var url = require('url');
var getIP = require('ipware')().get_ip;
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: './public/avatars'});
var session = require('express-session');
var mongoose = require('mongoose');


// MONGOOSE CODE

mongoose.connect('mongodb://localhost/data');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('Connected to MongoDB');
});

var userSchema = mongoose.Schema({
	email: String,
	username: String,
	password: String,
	description: String,
	image: String,
	admin: Number,
	views: [{ path: String, numViews: Number }],
	lastIP: String
});

var User = mongoose.model('User', userSchema);


// USE STATEMENTS

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'g5dodds'}));
app.use(bodyParser());
app.use(function(req, res, next) {
	var userIP = getIP(req);
	req.session.userIP = userIP.clientIp;
	next();
});
app.use(function(req, res, next) {
	// This updates page view numbers. Start by finding the current user
    User.findOne({ _id: req.session.userid } , function(err, user) {
		if (user) { // Make sure this user exists
			var pathname = url.parse(req.url).pathname;
			if (/^\/user\//.test(pathname) || /^\/userlist/.test(pathname)) {
				var i = 0, updated = false;
				// Cycle through user.views to find path
				while (i < user.views.length && !updated) {
					if (user.views[i].path == pathname) {
						user.views[i].numViews += 1;
						updated = true;
					} else {
						i += 1;
					}
				}
				// If path wasn't found add it with 1 pageview
				if (i == user.views.length) {
					user.views.push({path: pathname, numViews: 1});
				}
				user.markModified('views');
				user.save();
			}
		}
	});

	next();
})


// REQUESTS

app.get('/', function (req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Allow only people who aren't logged in or had their login invalidated.
		if (!clientUser || typeof req.session.userid == "undefined") {
			console.log('Root request');
			req.session.destroy();
			res.render('index');
		} else {
			console.log('Redirecting logged-in user')
			res.redirect('/userlist');
			return;
		}
	});
});

app.post('/login', function(req, res) {
	if (req.session.userid) {
		console.log('Redirecting logged-in user')
		res.redirect('/userlist');
		return;
	}
	console.log('Login request');
	User.findOne({ email: req.body.loginEmail }, function(err, user) {
		if (!user) {
		    res.render('index', { message: 'Invalid email or password.' });
		} else {
		    if (req.body.loginPassword === user.password) {
				console.log('login user has admin %s', user.admin);
				req.session.username = user.username;
				req.session.admin = user.admin;
				req.session.userid = user._id;
				user.lastIP = req.session.userIP;
				user.save();
			    res.redirect('/userlist');
		    } else {
			    res.render('index', { message: 'Invalid email or password.' });
		    }
		  }
    });
});

app.post('/signup', function(req, res) {
	console.log('Signup request');
	User.count({}, function(err, count) {
		var admin;
		if (count == 0) {
			admin = 2;
		} else {
			admin = 0;
		}
		
		User.findOne({ email: req.body.signupEmail }, function(err, user) {
			if (user) {
				res.render('index', { message: 'Email already in use.' });
			// regex from http://www.regular-expressions.info/email.html
			} else if (!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(req.body.signupEmail)) {
				res.render('index', {message: 'Invalid email.'});
			} else if (req.body.signupPassword != req.body.confirmPassword) {
				res.render('index', {message: 'Passwords do not match'});
			} else {
				User.create({
					email: req.body.signupEmail,
					username: 'Default',
					password: req.body.signupPassword,
					description: '',
					image: 'default.png',
					admin: admin,
					views: [],
					lastIP: req.session.userIP
					}, function (err, small) {
					if (err) return console.error(err);
				});
				
				if (admin) {
					var message = 'Created super administrator.';
				} else {
					var message = 'Created user.'
				}
				res.render('index', {message: message});
			}
		});
	});
});

app.get('/logout', function(req, res) {
	console.log('Logout request');
	req.session.destroy();
	res.render('index');
});

app.get('/userlist', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user');
			res.redirect('/');
			return;
		}
		console.log('Userlist request');
		
		User.find({}, function(err, users) {
			if (err) return console.error(err);
		
			res.render('userlist', {users: users,
									username: req.session.username,
									id: req.session.userid,
									avatar: clientUser.image});
		});
	});
});

app.get('/user/:id', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Profile request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else {
				res.render('profile', {avatar: user.image,
									   clientAvatar: clientUser.image,
									   email: user.email,
									   username: user.username,
									   clientUsername: clientUser.username,
									   description: user.description,
									   id: id,
									   admin: user.admin,
									   clientid: req.session.userid,
									   clientAdmin: req.session.admin,
									   views: user.views,
									   ip: user.lastIP
				});
			}
		});
	});
});

app.get('/delete/:id', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Delete request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else if ((req.session.admin == 0 && req.session.userid != id) || req.session.admin == 1 && user.admin != 0) {
				res.redirect('/user/' + id);
			} else {
				if (user.image != 'default.png') {
					fs.unlinkSync('public/' + user.image, function(err) {
						if (err) return console.error(err);
					});
				}
				user.remove();
				res.redirect('/userlist');
			}
		});
	});
});

app.get('/admin/:id', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Edit request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else if (req.session.admin != 2) {
				res.redirect('/user/' + id);
			} else {
				user.admin = 1 - user.admin;
				user.save();
				res.render('edit', {avatar: user.image,
									clientAvatar: clientUser.image,
									clientUsername: clientUser.username,
									id: id,
									admin: user.admin,
									clientAdmin: req.session.admin,
									message: 'Successfully changed admin status'
				});
			}
		});
	});
});

app.get('/edit/:id', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Edit request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else if ((req.session.admin == 0 && req.session.userid != id) || (req.session.admin == 1 && user.admin != 0)) {
				res.redirect('/user/' + id);
			} else {
				res.render('edit', {avatar: user.image,
									clientAvatar: clientUser.image,
									clientUsername: clientUser.username,
									admin: user.admin,
									clientAdmin: req.session.admin,
									id: id
				});
			}
		});
	});
});

app.post('/infoedit/:id', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Edit info request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else if ((req.session.admin == 0 && req.session.userid != id) || req.session.admin == 1 && user.admin != 0) {
				res.redirect('/user/' + id);
			} else {
				if (req.body.username != '') {
					user.username = req.body.username;
				}
				if (req.body.description != '') {
					user.description = req.body.description;
				}
				user.save();
				res.redirect('/user/' + id);
			}
		});
	});
});

app.post('/upload/:id', upload.single('avatar'), function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Edit avatar request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else if (!req.file) {
				res.redirect('edit');
			} else if ((req.session.admin == 0 && req.session.userid != id) || req.session.admin == 1 && user.admin != 0) {
				fs.unlink(req.file.path, function(err) {
					if (err) return console.error(err);
				});
				res.redirect('/user' + id);
			} else {
				console.log(req.file);
				if (user.image != 'default.png') {
					fs.unlinkSync('public/' + user.image, function(err) {
						if (err) return console.error(err);
					});
				}
				user.image = 'avatars/' + req.file.filename;
				user.save();
				res.render('edit', {avatar: user.image,
									clientAvatar: clientUser.image,
									clientUsername: clientUser.username,
									id: id,
									admin: user.admin,
									clientAdmin: req.session.admin,
									message: 'Upload successful'
				});
			}
		});
	});
});

app.post('/password/:id', function(req, res) {
	User.findOne({ _id: req.session.userid } , function(err, clientUser) {
		// Redirect people without valid sessions
		if (!clientUser || typeof req.session.username == "undefined") {
			console.log('Redirecting logged-out user')
			res.redirect('/');
			return;
		}
		console.log('Edit info request');
		
		req.session.admin = clientUser.admin; // Update admin status in case it changed
		
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, user) {
			if (!user || err) {
				res.redirect('/userlist');
			} else if ((req.session.admin == 0 && req.session.userid != id) || req.session.admin == 1 && user.admin != 0) {
				res.redirect('/user/' + id);
			} else {
				if (req.body.oldPassword != user.password) {
					var message = 'Old password incorrect';
				} else if (req.body.newPassword != req.body.confirmPassword) {
					var message = 'New passwords don\'t match';
				} else {
					var message = 'Password changed successfully';
					user.password = req.body.newPassword;
					user.save();
				}
				res.render('edit', {avatar: user.image,
									clientAvatar: clientUser.image,
									clientUsername: clientUser.username,
									id: id,
									admin: user.admin,
									clientAdmin: req.session.admin,
									message: message
				});
			}
		});
	});
});


// SERVER START

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
	
    console.log('server listening at http://%s:%s', host, port);
});