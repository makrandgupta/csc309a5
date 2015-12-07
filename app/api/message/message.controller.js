'use strict';

var User = require('../../models/user.js');
var Message = require('../../models/message.js');

// render the inbox page
exports.getInboxPage = function(req, res) {
    Message.find({'_id': { $in: req.user.messages}}, function(err, messages) {
        if (err) return res.send(err);

        User.findById(req.user._id, function(err, user) {
            user.hasNewMessage = false;
            user.save(function(err) {
                res.render('inbox.ejs', {
                    me: user,
                    messages: messages,
                });
            });
        });
        
    });
}

// render the page for messaging a particular user
exports.getMessagePage = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) return res.send(err);

        if (!user) return res.send('Error: no such user.');

        res.render('message.ejs', {
            me: req.user,
            target: user,
        });
    });
}

// post request that messages a user
exports.message = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) return res.send(err);

        if (!user) return res.send('Error: no such user.');

        var message = new Message();

        message.targetUserId = user._id;
        message.sourceUserId = req.user._id;
        message.sourceUserName = req.user.displayName;
        message.text = req.body.message;

        message.save(function(err) {
            if (err) return res.send(err);

            user.hasNewMessage = true;
            user.messages.push(message._id);
            user.markModified('messages');
            user.save(function(err) {
                if (err) return res.send(err);

                res.redirect('/users/' + user._id);
            });
        });
    });
}

// get request that deletes a message
exports.deleteMessage = function(req, res) {
    Message.findById(req.params.id, function(err, message) {
        if (err) return res.send(err);
        if (!message) return res.send("Error: no such message.");

        // Don't let users delete others' messages.
        if (message.targetUserId != req.user._id) return res.send('Not yours.');

        // Remove the message from the DB.
        Message.remove({_id: message._id}, function(err) {
            if (err) return res.send(err);

            // Remove the message's id from the user's messages.
            var index = req.user.messages.indexOf(message._id);
            if (index > -1) req.user.messages.splice(index, 1);
            req.user.markModified('messages');
            req.user.save(function(err) {
                if (err) return res.send(err);

                res.redirect('/users/inbox');
            });
        });
    });
}
