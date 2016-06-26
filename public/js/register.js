$('button').click(function() {
	if ($('#password').val() !== $('#cpassword').val()) {
		$('#password').val('');
		$("#cpassword").val('');
	}
});