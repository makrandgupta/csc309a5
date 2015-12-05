'use strict';

var express = require('express');
var miscController = require('./misc.controller');

var router = express.Router();

router.get('/img/:file', miscController.image);

module.exports = router;
