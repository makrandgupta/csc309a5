'use strict';

var express = require('express');
var multer = require('multer');

var userController = require('./user.controller');
var adminController = require('./admin.controller');
var User = require('../../models/user');

var router = express.Router();

// router middleware to check if the user is an admin
function isAdmin(req, res, next){
    if (req.user.local.accountType === 'admin' || req.user.local.accountType === 'superAdmin') {
        return next();
    }
    res.redirect('/');
}

// define the upload directory
var upDest = __dirname;
console.log("updest:" + upDest);
upDest = upDest.replace("app/api/user", "views/assets/user_pictures");

// tell multer where to upload the files
var upload = multer({
    dest: upDest
});

// Search endpoints ----------------------------------------------------------
router.get('/search', userController.search);
router.post('/search', userController.searchResults);

// Basic user endpoints -------------------------------------------------------

router.get('/', userController.allUsers);
router.get('/s3', userController.listS3Branches);
router.get('/me', userController.me);
router.get('/me/edit', userController.editMe);
router.get('/edit/:id', userController.editUser);
router.get('/rate/:id/:rating', userController.rate);
router.post('/comment/:id', userController.comment);
router.get('/:id', userController.singleUser);
router.post('/:id', upload.single('picture'), userController.update);

// Admin endpoints ------------------------------------------------------------

router.get('/admin/edit/:id', isAdmin, adminController.editUser);
router.get('/delete/:id', isAdmin, adminController.delete);
router.get('/make-admin/:id', isAdmin, adminController.makeAdmin);
router.get('/remove-admin/:id', isAdmin, adminController.removeAdmin);

module.exports = router;
