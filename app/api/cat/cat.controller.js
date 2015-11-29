// /app/api/cat/cat.controller.js

'use strict';

var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');

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
    // Find the cat.
    Cat.findById(req.params.catid, function(err, cat) {
        if (err) res.send(err);

        if (!cat) res.send("Error: no such cat.");

        // Find the cat's owner.
        var ownerid = cat.owner;

        // Remove the cat.
        Cat.remove({_id: cat._id}, function(err) {
            if (err) res.send(err);

            // Redirect back to the user's profile.
            res.redirect('/users/' + ownerid);
        });
    });
};

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

