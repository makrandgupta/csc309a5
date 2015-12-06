'use strict';

var passportLocal = require('passport-local');
var passportFacebook = require('passport-facebook');
var User = require('./models/user');

var LocalStrategy = passportLocal.Strategy;
var FacebookStrategy = passportFacebook.Strategy;

var facebookAuth = {
    'clientID' : '846443832143866',
    'clientSecret' : '2f922ce98013e2988fb95bccc60d5c77',
    'callbackURL' : 'http://localhost:3000/auth/facebook/callback'
};

// expose this function to our app using module.exports
module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({'local.email':  email}, function(err, user) {
            // if there are any errors, return the error
            if (err) return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                // if there is no user with that email
                // create the user
                var newUser = new User();
                User.find(function(err, users) {
                    if (err) return done(err);
                    
                    if (typeof users !== 'undefined' && users.length > 0) {
                        // the array is defined and has at least one element
                        newUser.accountType = 'user';
                    } else {
                        newUser.accountType = 'superAdmin';
                    }
					
					// set the user's local credentials
                    newUser.local.email = email;
                    // use the generateHash function in our user model
                    newUser.local.password = newUser.generateHash(password);

                    // set defaults
					setUserDefaults(newUser, email);
                    
                    // save the user
                    newUser.save(function(err) {
                        if (err) return done(err);

                        return done(null, newUser);
                    });
                });
            }
        });
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    // callback with email and password from our form
    function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) return done(err);

            // if no user is found, return the message
            if (!user) {
                // req.flash is the way to set flashdata using connect-flash
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }

            // if the user is found but the password is wrong
            if (!user.validPassword(password)) {
                // create the loginMessage and save it to session as flashdata
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }

            // all is well, return successful user
            return done(null, user);
        });
    }));

    // =========================================================================
    // FACEBOOK LOGIN ==========================================================
    // =========================================================================

    passport.use(new FacebookStrategy({
        // pull in our app id and secret from our auth.js file
        clientID : facebookAuth.clientID,
        clientSecret : facebookAuth.clientSecret,
        callbackURL : facebookAuth.callbackURL
    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their facebook id
            User.findOne({'facebook.id': profile.id}, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err) return done(err);

                // if the user is found, then log them in
                if (user) return done(null, user); // user found, return that user

                // if there is no user found with that facebook id, create them
                var newUser = new User();

                console.log(profile); // TEST DEBUG

                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id; // set the users facebook id                   
                newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                newUser.facebook.name = profile.displayName; // look at the passport user profile to see how names are returned

                User.find(function(err, users) {
                    if (err) return done(err);
                    
                    if (typeof users !== 'undefined' && users.length > 0) {
                        newUser.accountType = 'user';
                    } else {
                        newUser.accountType = 'superAdmin';
                    }

                    // set defaults
                    setUserDefaults(newUser, newUser.facebook.name);

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err) return done(err);

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                });
            });
        });
    }));
};

function setUserDefaults(newUser, displayName) {
    // set the user's local credentials
    newUser.picture = "/views/assets/default.png";
    newUser.displayName = displayName;
    newUser.description = '';
    newUser.cats = [];
    newUser.comments = [];
    newUser.messages = [];
    newUser.hasNewMessage = false;
    newUser.rating = 0;
    newUser.ratings = [];
    newUser.markModified('ratings');
    newUser.ratingNum = 0;
    newUser.isCatWalker = false;
}
