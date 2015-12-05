'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define the schema for users.
var userSchema = mongoose.Schema({
    local : {
        email : String,
        password : String,
    },
    facebook : {
        id : String,
        token : String,
        name : String,
        email : String,
    },
    displayName : String,
    description : String,
    isCatWalker : Boolean,
    picture : String,
    accountType : String, // valid types: {user, admin, superAdmin}
    cats : [String], // array of ids
    comments : [String], // array of ids
    messages : [String], // array of ids
    phone : String,
    rating : Number,  // Average rating
    ratings : [{user: String, rating: Number}],  // Existing ratings associated w/ id, so we can change them
    ratingNum : Number  // Total users rated by for calculating average
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// Create the model for users.
var User = mongoose.model('User', userSchema);
module.exports = User;
