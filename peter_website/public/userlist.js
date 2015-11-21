$(document).ready(function() {
	/*$.getJSON('/usertable', function(data) {
		$.each(data, function(index, value) {
			var email = $("<button class='link'>" + value.email + "</button>");
			var username = $("<button class='link'>" + value.username + "</button>");
			
			var emailbox = $("<td></td>");
			var usernamebox = $("<td></td>");
			emailbox.append(email);
			usernamebox.append(username);
			
			var row = $("<tr></tr>");
			row.append(emailbox);
			row.append(usernamebox);
			
			email.click(function () {
				goToUserPage(value._id);
			});
			username.click(function () {
				goToUserPage(value._id);
			});
			
			$("tbody").append(row);
		});
	});
	*/
});

function goToUserPage(id) {
	$.get('/profile.html', JSON.stringify(id));
}