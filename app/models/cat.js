// app/models/cat.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var catSchema = mongoose.Schema({
        owner : ObjectId, // user's id
	name : String,
	age : String,
	weight : String,
	color : String,
	picture : String,
	breed : String 
});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('Cat', catSchema);
