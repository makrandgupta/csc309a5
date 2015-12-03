/**
 * Created by makrand on 11/22/15.
 */
'use strict';

var express = require('express');
var userController = require('./user.controller');
var adminController = require('./admin.controller');
var User = require('../../models/user');
var multer= require('multer');

var router = express.Router();



//router middleware to check if the user is an admin
function isAdmin(req, res, next){
    if(req.user.local.accountType === 'admin' || req.user.local.accountType === 'superAdmin') {
       return next();
    }
    res.redirect('/');
}

//define the upload directory
var upDest = __dirname;
console.log("updest:" + upDest);
upDest = upDest.replace("app/api/user", "views/assets/user_pictures");

//tell multer where to upload the files
var upload = multer({
    dest: upDest
});


//basic user endpoints

router.get('/', userController.allUsers);
router.get('/me', userController.me);
router.get('/me/edit', userController.editMe);
router.get('/:id', userController.singleUser); //merge /profile into
router.get('/edit/:id', userController.editUser); //remove internal api reference
router.get('/rate/:id/:rating', userController.rate);
// router.post('/', userController.create);
router.post('/:id', upload.single('picture'), userController.update);

//admin endpoints

router.get('/admin/edit/:id', isAdmin, adminController.editUser);
router.get('/delete/:id', isAdmin, adminController.delete);
router.get('/make-admin/:id', isAdmin, adminController.makeAdmin);
router.get('/remove-admin/:id', isAdmin, adminController.removeAdmin);

module.exports = router;
