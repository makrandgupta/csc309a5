'use strict';

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        if (req.isAuthenticated()) return res.redirect('/users');
        
        res.render('index.ejs');
    });

    //login route
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

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

    //logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // Insert routes below.
    app.use('/misc', isLoggedIn, require('./api/misc'));
    app.use('/users', isLoggedIn, require('./api/user'));
    app.use('/cats', isLoggedIn, require('./api/cat'));
    app.use('/messages', isLoggedIn, require('./api/message'));
};

// router middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
