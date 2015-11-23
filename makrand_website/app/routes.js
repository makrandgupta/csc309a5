// app/routes.js

var User = require('./models/user');
var request = require('request');
var multer= require('multer');
var fs = require('fs');

//define the upload directory
var upDest = __dirname;
upDest = upDest.replace("app", "views/assets/user_pictures");

//tell mutler where to upload the files
var upload = multer({
	dest: upDest,
});


// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		
		if(isLoggedIn){
			// console.log("I'm Logged in Mofo!");
			res.render('index.ejs', {
				user: req.user
			});
		} else {
			res.render('index.ejs', {
			}); // load the index.ejs file
		}
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', {
			message: req.flash('loginMessage') 
		});
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/users', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { 
			message: req.flash('signupMessage') 
		});
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/users', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROTECTED ROUTES =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	
	app.get('/profile', isLoggedIn, function(req, res) {
		var user = 
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});
	
	app.get('/profile/:user_id', isLoggedIn, function(req, res) {
		var endpoint = 'http://localhost:3000/users/';
		endpoint += req.params.user_id;
		request(endpoint, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var out = JSON.parse(body);
				
				res.render('profile.ejs', {
					viewUser: out,
					user : req.user,
					admin: req.user
				});
			}
		})
	});
	app.get('/edit/:user_id', isLoggedIn, function(req, res){
		var endpoint = 'http://localhost:3000/users/';
		endpoint += req.params.user_id;
		request(endpoint, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var out = JSON.parse(body);
				
				res.render('edit.ejs', {
					user: req.user,
					editUser: out
				});
			}
		});
	});
	app.get('/admin/edit/:user_id', isLoggedIn, function(req, res){
		if(req.user.local.accountType === 'admin' || req.user.local.accountType === 'superAdmin'){
			res.redirect('/edit/'+req.params.user_id);
		}
	});
	
	app.get('/admin/delete/:user_id', isLoggedIn, function(req, res){
		if(req.user.local.accountType === 'admin' || req.user.local.accountType === 'superAdmin'){
			User.remove({
				_id: req.params.user_id
			}, function (err, user) {
				if (err)
					// res.send(err);
				console.log('deleted');
				res.redirect('/users');
			})
		}
	});
	
	app.get('/admin/make-admin/:user_id', isLoggedIn, function(req, res){
		User.findById(req.params.user_id, function(err, user){
			if(err) res.send(err);
				user.local.accountType = 'admin';

				//save the user
				user.save(function(err) {
					if(err) res.send(err);
					
					res.redirect('/users');
				});
			});
	});
	app.get('/admin/remove-admin/:user_id', isLoggedIn, function(req, res){
		User.findById(req.params.user_id, function(err, user){
			if(err) res.send(err);
				user.local.accountType = 'user';

				//save the user
				user.save(function(err) {
					if(err) res.send(err);
					
					res.redirect('/users');
				});
			});
	});
	app.route('/users')
		.all(isLoggedIn)
	
		.get(function(req, res){
			User.find(function(err, usersa) {
				if(err) res.send(err);
				console.log(usersa);
				// return the users list 
				res.render('home.ejs', {
					users : usersa,
					user : req.user
				});
			});
		})
		
		//new user
		.post(function(req, res){
			
			var user = new User();//new instance of User model
			
			//set user info from req
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;
			
			//save and check for errors
			user.save(function(err){
				if(err){
					// duplicate entry
					if(err.code == 11000)
						return res.json({success: false, message: 'A user with that username already exists'});
					else 
						return res.send(err);
				}
				
				res.json({success: true, message: 'User created!'});
			});
			
		});
		
	
	//get user with that ids
	app.get('/users/:user_id', function(req, res){
		User.findById(req.params.user_id, function(err, user) {
			if(err) res.send(err);
			
			// return found user
			res.json(user);
		});
	});
	app.post('/users/:user_id', upload.single('picture'), function(req, res){
		console.log(req.file);
		if(req.body.method === "put"){
			//find the user being updated
			User.findById(req.params.user_id, function(err, user){
				if(err) res.send(err);
				var finalPath;
				
				//update the user info if new
				if(req.body.displayName) user.local.displayName = req.body.displayName;
				if(req.body.description) user.local.description= req.body.description;
				if(req.body.password) user.local.password = user.generateHash(req.body.password);

				if(req.file){
					if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/bmp' || req.file.mimetype === 'image/png'){
						finalPath = req.file.path;
						switch (req.file.mimetype){
							case 'image/jpeg':
								finalPath += '.jpg';
								break;
							case 'image/bmp':
								finalPath += '.bmp';
								break;
							case 'image/png':
								finalPath += '.png';
								break;
						}
						
						console.log('test:'+finalPath);

						fs.rename(req.file.path, finalPath, function(err) {
							if ( err ) console.log('ERROR: ' + err);
							
							user.local.picture = finalPath;
							console.log('maybe:'+ user.local.path);
						});
					}
				
					finalPath = finalPath.replace(req.file.destination, '/img');
					user.local.picture = finalPath;
					console.log('dbpath: ' + user.local.picture);
				}
				//save the user
				user.save(function(err) {
					if(err) res.send(err);
					
					res.redirect('/profile/'+req.params.user_id);
				});
			});
		}
		
	});
	
	app.get('/img/:file', function(req, res) {
		res.sendfile('./views/assets/user_pictures/'+req.params.file);
	});
		
	app.get('/buzz/:user_id', function(req, res) {
		//find the user being updated
		User.findById(req.params.user_id, function(err, user){
			if(err) res.send(err);
			
			
			//update the user info if new
			user.local.displayName = 'Makrand';
			// user.username = req.body.username;
			// user.password = req.body.password;
			
			//save the user
			user.save(function(err) {
				if(err) res.send(err);
				
				//return success and show updated info
				res.render({success: true, message: 'User updated!', user: user});
			});
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

