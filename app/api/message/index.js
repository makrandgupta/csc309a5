'use strict';

var express = require('express');
var messageController = require('./message.controller');

var router = express.Router();

router.get('/inbox', messageController.getInboxPage);
router.get('/delete/:id', messageController.deleteMessage);
router.get('/:id', messageController.getMessagePage);
router.post('/:id', messageController.message);

module.exports = router;
