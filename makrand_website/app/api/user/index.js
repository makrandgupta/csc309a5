/**
 * Created by makrand on 11/22/15.
 */
'use strict';

var express = require('express');
var userController = require('./user.controller');
var adminController = require('./admin.controller');
var User = require('./../models/user');

var router = express.Router();

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function isAdmin(req, res, next){
    if(req.user.local.accountType === 'admin' || req.user.local.accountType === 'superAdmin') {
       return next();
    }
    res.redirect('/');
}

//define the upload directory
var upDest = __dirname;
upDest = upDest.replace("app", "views/assets/user_pictures");

//tell mutler where to upload the files
var upload = multer({
    dest: upDest,
});


//basic user endpoints

router.all(isLoggedIn);
router.get('/', userController.allUsers);
router.get('/:id', userController.singleUser); //merge /profile into
router.get('/edit/:id', userController.editUser); //remove internal api reference
router.post('/', userController.create);
router.post('/:id', upload.single('picture'), userController.update);

//admin endpoints

router.get('/edit/:id', isAdmin, adminController.modify);
router.get('/delete/:id', isAdmin, adminController.delete);
router.get('/make-admin/:id', isAdmin, adminController.makeAdmin);
router.get('/remove-admin/:id', isAdmin, adminController.removeAdmin);

module.exports = router;