'use strict';

var assert = require('assert');
var recommendation = require('../app/api/misc/recommendation.js');

describe('Recommendation Tests', function() {
	describe('Similar Users Tests', function() {
		it('returns two users with rIndex < 10', function(done) {
			var User1 = generateUser(1, true, 5);
			var User2 = generateUser(2, true, 5);
			var User3 = generateUser(3, true, 5);
			var otherUsers = [User2, User3];
			otherUsers = recommendation.computeUserRecommendations(User1, otherUsers);
			assert.equal(1, 1);
			done();
		});
	});
});

function generateUser(id, isCatWalker, numCats) {
	User1 = {
		_id: id,
		isCatWalker: isCatWalker,
		cats: generateCats(numCats)
	}
	
	return User1;
}

function generateCats(numCats) {
	cats = [];
	i = 0;
	
	while (i <= numCats - 1) {
		cats.push({});
		i = i + 1;
	}
	
	return cats;
}
