// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
	displayName  : String,
	description  : String,
	isCatWalker  : Boolean,
	picture	     : String,
	accountType  : String, //valid types: {user, admin, superAdmin}
	cats	     : [String], //array of ids
	phone        : String,
	rating       : Number,  // Average rating
	ratings      : {String : Number},  // Existing ratings accessed by id, so we can change them
	ratingNum    : Number  // Total users rated by for calculating average

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
