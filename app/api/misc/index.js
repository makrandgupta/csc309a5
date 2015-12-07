'use strict';

var express = require('express');
var miscController = require('./misc.controller');

var router = express.Router();

router.get('/sign_s3', miscController.sign_s3);

module.exports = router;
