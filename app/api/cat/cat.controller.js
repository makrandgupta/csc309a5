// /app/api/cat/cat.controller.js

'use strict';

var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');
var request = require('request');
var multer = require('multer');
var fs = require('fs');

// Cat edit page --------------------------------------------------------------

exports.getCatEditPage = function(req, res) {
    Cat.findById(req.params.catid, function(err, cat) {
        if (err) res.send(err);

        // Send the cat edit page.
        res.render('editcat.ejs', {
            cat : cat
        });
    });
};

// Cat API --------------------------------------------------------------------

// Create a new cat given a user id, and redirect to 'edit cat' page.
exports.newCat = function(req, res) {
    var userid = req.params.userid;
    User.findById(userid, function(err, user) {
        if (err) res.send(err);

        if (!user) res.send("Error: no such user.");

        var cat = new Cat();
        cat.owner = user._id;
	cat.name = '';
	cat.age = '';
	cat.weight = '';
	cat.color = '';
	cat.breed = '';
        cat.save(function(err) {
            if (err) res.send(err);

            user.cats.push(cat);
            user.markModified('cats');
            user.save(function(err) {
                if (err) res.send(err);

                res.redirect('/cats/edit/' + cat._id);
            });
        });
    });
};

