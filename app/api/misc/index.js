/**
 * Created by makrand on 11/24/15.
 */

'use strict';

var express = require('express');
var miscController = require('./misc.controller');

var router = express.Router();

router.get('/img/:file', miscController.image);
router.get('/sign_s3', miscController.sign_s3);

module.exports = router;