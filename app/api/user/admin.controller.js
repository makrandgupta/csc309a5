/**
 * Created by makrand on 11/24/15.
 */

'use strict';

var User = require('../../models/user.js');

//admin endpoints

//router.get('/admin/edit/:id', isAdmin, adminController.modify);
exports.editUser = function (req, res) {
    res.redirect('/users/edit/'+req.params.id);
};

//router.get('/delete/:id', isAdmin, adminController.delete);
exports.delete = function (req, res) {
        console.log('I am in the delete function');
        User.remove({
            _id: req.params.id
        }, function (err) {
            if (err)
            // res.send(err);
                console.log('deleted');
            res.redirect('/users');
        })
};

//router.get('/make-admin/:id', isAdmin, adminController.makeAdmin);
exports.makeAdmin = function (req, res) {
    User.findById(req.params.id, function(err, user){
        if(err) res.send(err);

        user.local.accountType = 'admin';

        //save the user
        user.save(function(err) {
            if(err) res.send(err);

            res.redirect('/users');
        });
    });
};

//router.get('/remove-admin/:id', isAdmin, adminController.removeAdmin);
exports.removeAdmin = function (req, res) {
    User.findById(req.params.id, function(err, user){
        if(err) res.send(err);
        user.local.accountType = 'user';

        //save the user
        user.save(function(err) {
            if(err) res.send(err);

            res.redirect('/users');
        });
    });
};
