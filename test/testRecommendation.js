'use strict';

var assert = require('assert');
var mongoose = require('mongoose');
var recommendation = require('../app/api/misc/recommendation.js');

describe('Recommendation Tests', function() {
	describe('Similar Users Tests', function() {
		it('returns two users with rIndex < 10', function(done) {
			var User1 = generateUser(true, 5);
			var User2 = generateUser(true, 4);
			var User3 = generateUser(false, 6);
			var otherUsers = [User2, User3];
			recommendation.computeUserRecommendations(User1, otherUsers);
			assert.equal(User2['rIndex'], 8.4);
			assert.equal(User3['rIndex'], 9.5);
			assert.equal(otherUsers[0]['_id'], User2['_id']);
			done();
		});
	});
	
	describe('Different Users Tests', function() {
		it('returns two users with rIndex >= 10', function(done) {
			var User1 = generateUser(true, 5);
			var User2 = generateUser(true, 2);
			var User3 = generateUser(false, 7);
			var otherUsers = [User2, User3];
			recommendation.computeUserRecommendations(User1, otherUsers);
			assert.equal(User2['rIndex'], 11.6);
			assert.equal(User3['rIndex'], 10.5);
			assert.equal(otherUsers[0]['_id'], User3['_id']);
			done();
		});
	});	
});

function generateUser(isCatWalker, numCats) {
	var User1 = {
		_id: mongoose.Types.ObjectId(),
		isCatWalker: isCatWalker,
		cats: generateCats(numCats)
	}
	
	return User1;
}

function generateCats(numCats) {
	var cats = [];
	var i = 0;
	
	while (i <= numCats - 1) {
		cats.push({});
		i = i + 1;
	}
	
	return cats;
}
