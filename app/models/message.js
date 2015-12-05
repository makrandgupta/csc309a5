// app/models/message.js

'use strict';

var mongoose = require('mongoose');

// Define the schema for messages.
var messageSchema = mongoose.Schema({
	targetUserId : String,
	sourceUserId : String,
	sourceUserName : String,
	text : String,
});

// Create the model for messages.
var Message = mongoose.model('Message', messageSchema);
module.exports = Message
