// /app/api/cat/cat.controller.js

'use strict';

var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');

var fs = require('fs');
var multer = require('multer');

// Cat API --------------------------------------------------------------------

// Send the cat edit page for a particular cat.
exports.getCatEditPage = function(req, res) {
    Cat.findById(req.params.catid, function(err, cat) {
        if (err) res.send(err);

        res.render('editcat.ejs', {
            cat : cat
        });
    });
};

// Delete a particular cat.
exports.deleteCat = function(req, res) {
    Cat.findById(req.params.catid, function(err, cat) {
        if (err) return res.send(err);
        if (!cat) return res.send("Error: no such cat.");

        // Don't let users delete others' cats.
        if (cat.owner != req.user._id) return res.send('Not yours.');

        // Find the cat's owner, so we can redirect the user to their profile,
        //   even after deleting the cat.
        var ownerid = cat.owner;

        // Remove the cat.
        Cat.remove(cat._id, function(err) {
            if (err) return res.send(err);

            // Remove the cat's id from the user's cats.
            var index = req.user.cats.indexOf(cat._id);
            if (index > -1) req.user.cats.splice(i, 1);
            req.user.markModified('cats');
            req.user.save(function(err) {
                if (err) return res.send(err);

                // Redirect back to the user's profile.
                res.redirect('/users/' + ownerid);
            });
        });
    });
};

// Create a new cat given a user id, and redirect to 'edit cat' page.
exports.newCat = function(req, res) {
    User.findById(req.params.userid, function(err, user) {
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

            user.cats.push(cat._id);
            user.markModified('cats');
            user.save(function(err) {
                if (err) res.send(err);

                res.redirect('/cats/edit/' + cat._id);
            });
        });
    });
};

// 
exports.updateCat = function(req, res) {
    Cat.findById(req.params.catid, function(err, cat) {
        if (err) res.send(err);

        if (req.body.name) cat.name = req.body.name;
        if (req.body.age) cat.age = req.body.age;
        if (req.body.weight) cat.weight = req.body.weight;
        if (req.body.color) cat.color = req.body.color;
        if (req.body.breed) cat.breed = req.body.breed;
        if (req.body.walker)
            cat.needsWalker = true;
        else
            cat.needsWalker = false;

        console.log(req.body);

        if (req.file) {
            var filePath;
            if (req.file.mimetype === 'image/jpeg' ||
                    req.file.mimetype === 'image/bmp' ||
                    req.file.mimetype === 'image/png') {
                filePath = req.file.path;
                switch (req.file.mimetype) {
                    case 'image/jpeg':
                        filePath += '.jpg';
                        break;
                    case 'image/bmp':
                        filePath += '.bmp';
                        break;
                    case 'image/png':
                        filePath += '.png';
                        break;
                    default:
                        filePath = filePath;
                }

                fs.rename(req.file.path, filePath, function(err) {
                    if (err) console.log('ERROR: ' + err);

                    cat.picture = filePath;
                });
            }

            filePath = filePath.replace(req.file.destination, '/misc/img');
            cat.picture = filePath;
        }

        cat.save(function(err) {
            if (err) res.send(err);

            res.redirect('/users/' + cat.owner);
        });
    });
};

