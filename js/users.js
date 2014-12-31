function registerSigninEvents() {
	$("#signin").click(function(e) {
		$("#signin-error-panel").hide();
		
		var user = $("#inputAccount").val(),
			password = $("#inputPassword").val();
			
		if (user == "" || password == "") return;
		
		e.preventDefault();
		
		$.print("Logging in by: " + user);
		BaasBox.login(user, password)
			.done(function(res) {
				loginSuccess(res);
				$("#inputAccount").val("");
				$("#inputPassword").val("");
			})
			.fail(function (err) {
				$("#signin-error-panel").fadeIn();
			});
	});
	
	$("#inputAccount, #inputPassword").keyup(function(event){
		if(event.keyCode == 13){
			$("#signin").click();
		}
	});
	
	$("#signout").click(function(){
		BaasBox.logout();
		logout();
	});
	
}

function registerUsersEvents() {
	$("#signup-gate").click(function(event) {
		$("#signin-error-panel").hide('slideUp');
		$("#signin-form").fadeOut(function() {
			$("#signup-form").fadeIn();
		});
	});

	$("#signin-gate").click(function(event) {
		$("#signin-error-panel").hide('slideUp');
		$("#signup-form").fadeOut(function() {
			$("#signin-form").fadeIn();
		});
	});

	$("#new-account").on("change", function(e){
		var user = $("#new-account").val();
		// TODO: see bellow msg
		$.print("TODO: check if the user name [" + user + "] exist, when BaasBox has such an Api.")
	});

	$("#signup").click(function(e) {
		e.preventDefault();

		$("#signup-error-panel").hide();
		
		var user = $("#new-account").val(),
			password = $("#new-password").val(),
			password2 = $("#re-password").val(),
			userInfo = {
				name: $("#new-name").val(),
				email: $("#new-email").val(),
			}; 
		
		// TODO: better checks
		if (password !== password2) {
			$("#signup-error-panel").text("please confirm password").fadeIn();
			return;
		}

		if (userInfo.email.indexOf('@') === -1){
			$("#signup-error-panel").text("Invalid email").fadeIn();
			return;
		}
		if (userInfo.name === ""){
			$("#signup-error-panel").text("Invalid account name").fadeIn();
			return;
		}

		BaasBox.signup(user, password, {"visibleByTheUser": userInfo})
			.done(function(res) {
				$.print("signup success");
				$.print(res);
				$("#signup-form").fadeOut(function() {
					loginSuccess(res);
				});
			})
			.fail(function (err) {
				var errInfo = JSON.parse(err.responseText);
				$("#signup-error-panel").text("Error: " + errInfo.message).fadeIn();
				$("#signup-error-panel").fadeIn();
			});
	});
}
