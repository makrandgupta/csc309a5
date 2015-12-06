'use strict';

var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');
var Comment = require('../../models/comment.js');

var fs = require('fs');

/*
* Get and render a list of all users
* */

exports.allUsers = function (req, res) {
    User.find(function(err, users) {
        if(err) res.send(err);
        // return the users list
        res.render('home.ejs', {
            users : users,
            me : req.user
        });
    });
};

/*
* Get the logged in user
* */

exports.me = function (req, res) {
    Cat.find({'_id': { $in: req.user.cats}}, function(err, cats) {
        if(err) return res.send(err);

        Comment.find({'_id': { $in: req.user.comments}}, function(err, comments) {
            if(err) return res.send(err);
        	    
        	res.render('profile.ejs', {
        	    me : req.user, // get the user out of session and pass to template
                viewUser : req.user,

        	    cats: cats,
                comments: comments,
        	});
        });
    });
};

/*
* Edit logged in user
* */

exports.editMe = function (req, res) {
    res.render('edit.ejs', {
        me: req.user,
        editUser: req.user
    });
};

/*
* Get search page
* */

exports.search = function (req, res) {
	res.render('search.ejs', {
		me: req.user,
	});
};

/*
* Search user results.
* */

exports.searchResults = function (req, res) {
	var displayName = req.body['displayName'];
	var type = req.body['type'];
	var userTypeHasher = {
			walkers: true,
			nonwalkers: false
	}
	var query = {'displayName' : { $regex: displayName, $options: 'i' }};
	
	if (type != 'all') {
		query['isCatWalker'] = userTypeHasher[type];
	}
		
	if (req.body.includeratings) {
		query['rating'] = {$gte: Number(req.body.minrating), $lte: Number(req.body.maxrating)};
	}

	User.find(query).lean().exec(function(err, results) {
		if (err) {
			return res.send(err);
		}
		
		results = computeUserRecommendations(req.user, results);
		res.render('home.ejs', {
            users : results,
            me : req.user,
            message : 'Search Results for Users'
        });
	});
};

/*
* Get single user information
* */

exports.singleUser = function (req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) return res.send(err);
	
		Cat.find({'_id': { $in: user.cats}}, function(err, cats) {
			if(err) return res.send(err);

            Comment.find({'_id': { $in: user.comments}}, function(err, comments) {
                if(err) return res.send(err);
    	    
    			res.render('profile.ejs', {
        			viewUser: user,
        			me : req.user,

        			cats: cats,
                    comments: comments,
    			});
            });
        });
    });
};

/*
* Display form to edit singe user
* */

exports.editUser = function (req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) res.send(err);

        res.render('edit.ejs', {
            me: req.user,
            editUser: user
        });
    });
};


/*
* Update user
* */

exports.update = function(req, res) {
    if(req.body.method === "put"){
        //find the user being updated
        User.findById(req.params.id, function(err, user){
            if(err) res.send(err);
            var finalPath;

            //update the user info if new
            if(req.body.displayName) user.displayName = req.body.displayName;
            if(req.body.description) user.description = req.body.description;
	    if(req.body.phone) user.phone = req.body.phone;
            if(req.body.password) user.local.password = user.generateHash(req.body.password);
	    if(req.body.walker)
		user.isCatWalker = true;
	    else
		user.isCatWalker = false;
	    

            if(req.file){
                if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/bmp' || req.file.mimetype === 'image/png'){
                    finalPath = req.file.path;
                    switch (req.file.mimetype){
                        case 'image/jpeg':
                            finalPath += '.jpg';
                            break;
                        case 'image/bmp':
                            finalPath += '.bmp';
                            break;
                        case 'image/png':
                            finalPath += '.png';
                            break;
						default:
							finalPath = finalPath;
                    }

                    fs.rename(req.file.path, finalPath, function(err) {
                        if (err) console.log('ERROR: ' + err);

                        user.picture = finalPath;
                        console.log('maybe:'+ user.path);
                    });
                }

                finalPath = finalPath.replace(req.file.destination, '/misc/img');
                user.picture = finalPath;
                console.log('dbpath: ' + user.picture);
            }
            //save the user
            user.save(function(err) {
                if(err) res.send(err);

                res.redirect('/users/'+req.params.id);
            });
        });
    }
};

exports.rate = function(req, res) {
	User.findById(req.params.id, function(err, user) {
        if(err) res.send(err);
		
		// Check that we have an appropriate rating value here
        if (!isNaN(req.params.rating) && req.params.rating >= 1 && req.params.rating <= 5) {
			// Get total of ratings by multiplying the average by # of ratings
			var total = user.rating * user.ratingNum;
			
			// Find whether the requesting user has rated this user already
			var result = user.ratings.filter(function( obj ) {
				return obj.user == req.user._id;
			});
			// result is not empty if they have rated before
			if (result.length != 0) {
				// Subtract user's rating from total then update their rating
				total -= result[0].rating;
				result[0].rating = Number(req.params.rating);
			} else {
				// Increment total amount of ratings and push user's rating to list of ratings
				user.ratingNum++;
				user.ratings.push({'user' : req.user._id, 'rating' : Number(req.params.rating)});
			}
			// Add new rating to the total then divide by # of ratings to get average
			total += Number(req.params.rating);
			user.rating = total / user.ratingNum;
			
			user.markModified('ratings');
		}
		user.save(function(err) {
			if(err) res.send(err);
			
			res.redirect('/users/'+req.params.id);
		});
    });
}

// post request that comments on a user's profile
exports.comment = function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) return res.send(err);

        if (!user) return res.send('Error: no such user.');

        var comment = new Comment();

        comment.targetUserId = user._id;
        comment.sourceUserId = req.user._id;
        comment.sourceUserName = req.user.displayName;
        comment.text = req.body.comment;

        comment.save(function(err) {
            if (err) return res.send(err);

            user.comments.push(comment._id);
            user.markModified('comments');
            user.save(function(err) {
                if (err) return res.send(err);

                res.redirect('/users/' + user._id);
            });
        });
    });
}

/*
* Calculate the rIndex between each user in 'otherUsers' to 'user' and
* return 'otherUsers' as sorted list by their rIndex in non-decreasing
* order.
* 
* The lower a rIndex between two users, the more likely they
* are to be recommended to each other.  An rIndex is always nonnegative.
* */

function computeUserRecommendations(user, otherUsers) {
	var START_INDEX = 10;
	var i = 0;

	while (i <= otherUsers.length - 1) {
		if (user['_id'].equals(otherUsers[i]['_id'])) {
			otherUsers.splice(i, 1);
			continue;
		}

		var rIndex = START_INDEX;

		// Compare their number of cats
		rIndex = rIndex + Math.abs(otherUsers[i]['cats'].length - user['cats'].length);

		// Compare their cat walker status
		if (otherUsers[i]['isCatWalker'] !== user['isCatWalker']) {
			rIndex = Math.max(rIndex - START_INDEX, 0);
		}

		otherUsers[i]['rIndex'] = rIndex;
		i = i + 1;
	}

	otherUsers.sort(compareUsers);
	return otherUsers;
}

/*
* Compare 'userA' and 'userB' by their the rIndices.
* */
function compareUsers(userA, userB) {
  return userA['rIndex'] - userB['rIndex'];
}
