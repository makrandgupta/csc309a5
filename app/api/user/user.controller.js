/**
 * Created by makrand on 11/22/15.
 */
'use strict';

var User = require('./../models/user.js');
var request = require('request');
var multer= require('multer');
var fs = require('fs');

/*
* Get and render a list of all users
* */

exports.allUsers = function (req, res) {
    User.find(function(err, users) {
        if(err) res.send(err);
        // return the users list
        res.render('home.ejs', {
            users : users,
            user : req.user
        });
    });
};

/*
* Get the logged in user
* */

exports.me = function (req, res) {
    Cat.find({'_id': { $in: [user.cats]}, function(err, cats) {
	if(err) res.send(err);
	    
	res.render('profile.ejs', {
	    user : req.user, // get the user out of session and pass to template
	    cats: cats
	});
    });
};

/*
* Edit logged in user
* */

exports.editMe = function (req, res) {
    res.render('edit.ejs', {
        user: req.user,
        editUser: req.user
    });
};


/*
* Get single user information
* */

exports.singleUser = function (req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) res.send(err);
	
	Cat.find({'_id': { $in: [user.cats]}, function(err, cats) {
	    if(err) res.send(err);
	    
	    res.render('profile.ejs', {
		viewUser: user,
		user : req.user,
		cats: cats
	    });
	});
    });
};

/*
* Display form to edit singe user
* */

exports.editUser = function (req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) res.send(err);

        res.render('edit.ejs', {
            user: req.user,
            editUser: user
        });

    });
};

/*
* Add new user
* */

exports.create = function (req, res) {
    var user = new User();//new instance of User model

    //set user info from req
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;
    user.cats = [];

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
};

/*
* Update user
* */

exports.update = function(req, res) {
    if(req.body.method === "put"){
        //find the user being updated
        User.findById(req.params.id, function(err, user){
            if(err) res.send(err);
            var finalPath;

            //update the user info if new
            if(req.body.displayName) user.displayName = req.body.displayName;
            if(req.body.description) user.description= req.body.description;
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
			default:
			     finalPath = finalPath;
                    }

                    fs.rename(req.file.path, finalPath, function(err) {
                        if (err) console.log('ERROR: ' + err);

                        user.picture = finalPath;
                        console.log('maybe:'+ user.path);
                    });
                }

                finalPath = finalPath.replace(req.file.destination, '/misc/img');
                user.picture = finalPath;
                console.log('dbpath: ' + user.picture);
            }
            //save the user
            user.save(function(err) {
                if(err) res.send(err);

                res.redirect('/users/'+req.params.id);
            });
        });
    }
};