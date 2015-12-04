// app/models/comment.js

'use strict';

var mongoose = require('mongoose');

// Define the schema for comments.
var commentSchema = mongoose.Schema({
	targetUserId : String,
	sourceUserId : String,
	sourceUserName : String,
	text : String,
});

// Create the model for comments.
var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment
