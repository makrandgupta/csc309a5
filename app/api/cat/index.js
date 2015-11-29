// /app/api/cat/index.js

'use strict';

var express = require('express');
var multer = require('multer');

var catController = require('./cat.controller');
var Cat = require('../../models/cat');

// Setup ----------------------------------------------------------------------

// Multer upload destination.
var upload = multer({
    // Note: current dir is "~~~/csc309a5/app/api/cat/".
    // Destination should be "~~~/csc309a5/views/assets/user_pictures/".
    dest: __dirname.replace("app/api/cat", "views/assets/user_pictures")
});

// Routes ---------------------------------------------------------------------

var router = express.Router();

// TODO: check permissions before performing actions

// Cat edit page.
router.get('/edit/:catid', catController.getCatEditPage);

// Cat API.
//router.get('/delete/:catid', catController.deleteCat);
router.get('/new/:userid', catController.newCat);
//router.get('/update/:catid', catController.updateCat);

module.exports = router;

