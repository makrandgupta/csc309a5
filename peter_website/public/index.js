$(document).ready(function() {
	$('#login').click(function() {
		$('#signinButtons').css('display', 'none');
		$('#loginForm').css('display', 'block');
	});
	$('#signup').click(function() {
		$('#signinButtons').css('display', 'none');
		$('#signupForm').css('display', 'block');
	});
	$('.back').click(function() {
		$('#signinButtons').css('display', 'block');
		$('#loginForm').css('display', 'none');
		$('#signupForm').css('display', 'none');
	});
});