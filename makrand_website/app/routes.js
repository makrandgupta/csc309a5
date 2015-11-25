/**
 * Created by makrand on 11/23/15.
 */
/**
 * Main application routes
 */

'use strict';

// router middleware to make sure user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = function(app, passport) {

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

    // Insert routes below
    //app.use('/api/rentals', require('./api/rental'));
    //app.use('/api/reservation-requests', require('./api/reservation-request'));
    //app.use('/api/products', require('./api/product'));
    //app.use('/api/things', require('./api/thing'));
    app.use('/users', isLoggedIn, require('./api/user'));

    //app.use('/auth', require('./auth'));
};