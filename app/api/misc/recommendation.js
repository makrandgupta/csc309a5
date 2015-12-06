'use strict';

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
		var numUserCats = user['cats'].length;
		var numOtherUserCats = otherUsers[i]['cats'].length;
		var minNumCats = Math.min(numUserCats, numOtherUserCats);
		rIndex = rIndex +
				Math.abs(numOtherUserCats - numUserCats) -
				Math.max(minNumCats * minNumCats, 0) / 10;

		// Compare their cat walker status
		if (otherUsers[i]['isCatWalker'] === user['isCatWalker']) {
			rIndex = Math.max(rIndex - 2, 0);
		}
		else {
			rIndex = rIndex + 2;
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

exports.computeUserRecommendations = computeUserRecommendations;
