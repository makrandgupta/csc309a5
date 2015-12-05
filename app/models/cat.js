'use strict';

var mongoose = require('mongoose');

// Define the schema for cats.
var catSchema = mongoose.Schema({
    owner : String, // user's id
	name : String,
	age : String,
	weight : String,
	color : String,
	picture : String,
	breed : String,
	needsWalker: Boolean
});

// Create the model for cats.
var Cat = mongoose.model('Cat', catSchema);
module.exports = Cat;
