var allUsers = [];
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
				//$("#inputAccount").val("");
				//$("#inputPassword").val("");
			})
			.fail(function (err) {
				$("#signin-error-panel").fadeIn();
			});
	});
	
	$("#inputAccount, #inputPassword").keyup(function(event){
		if(event.keyCode == 13) { // 13 means "enter"
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

	// TODO: check need refactory to one place
	$("#new-account").on("change", function(e){
		var user = $("#new-account").val();
		$.get(BaasBox.endPoint + "/plugin/users.exist?username=" + user)
			.done(function(res){
				if (res.data === "exist"){
					$.notify("User name [" + user + "] has been used.");
				}
			});
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
			$("#signup-error-panel").text("Invalid name").fadeIn();
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

	$("#forgot-password").click(function(event) {
		var user = $("#inputAccount").val();

		$("#reset-password-confirm").modal();
		$("#reset-password-account").val(user);
	});

	$("#reset-password").click(function(event) {
		var user = $("#reset-password-account").val();
		// same as BaasBox.resetPassword();
		$.get(BaasBox.endPoint + '/user/' + user + '/password/reset')
			.done(function(res) {
				$.print("resetPassword mail send");
				$.notify("resetPassword mail send");
			})
			.fail(function (err) {
				var errInfo = JSON.parse(err.responseText);
				var errMsg = errInfo.message;
				$.print(errMsg);
				$.notify(errMsg);
			});

		$("#reset-password-confirm").modal('hide');
	});
    
    $("#user-list").click(function(event) {
        $("#list-user-form").fadeIn();
        $("#signin-form").hide();
		$("#app").hide();
		
        BaasBox.fetchUsers()
            .done(function(res){
            
                // data
                allUsers = [];
                for(var i = 0; i < res.data.length; i++){
                    var isActive, 
                        status = res.data[i].user.status;
                    
                    switch (status){
                    case "ACTIVE":
                        isActive = true;
                        break;
                    case "SUSPENDED":
                        isActive = false;
                        break;
                    default:
                        isActive = false;
                        if(DEBUG){
                            $.notify("User status is: " + status);
}
                        break;
                    }
                    
                    var user = {
                        name: res.data[i].user.name,
                        isActive: isActive
                    }
                    allUsers.push(user);
                }
                
                // view
                renderUsers(allUsers);
            })
            .fail(function (err) {
				//var errInfo = JSON.parse(err.responseText);
				var errMsg = JSON.stringify(err);
				$.print(errMsg);
				$.notify(errMsg);
			});
    });
    
    $("#active-user-list").on("click", "button", function(e){
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
        
        $.ajax({
            method: "PUT",
            url: BaasBox.endPoint + "/admin/user/suspend/" + name
        }).done(function(res){
            $.print(res);
             $user.remove().appendTo("#suspended-user-list").find("button").text("Suspend");
        }).fail(function (err) {
            //var errInfo = JSON.parse(err.responseText);
            var errMsg = JSON.stringify(err);
            $.print(errMsg);
            $.notify(errMsg);
        });
        
       
    });
    
    $("#suspended-user-list").on("click", "button", function(e){
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
        
        $.ajax({
            method: "PUT",
            url: BaasBox.endPoint + "/admin/user/activate/" + name
        }).done(function(res){
            $.print(res);
            $user.remove().appendTo("#active-user-list").find("button").text("Active");
        }).fail(function (err) {
            //var errInfo = JSON.parse(err.responseText);
            var errMsg = JSON.stringify(err);
            $.print(errMsg);
            $.notify(errMsg);
        });
    });
}

var renderUsers = function(users) {
    var $active = $("#active-user-list"); 
    var $suspend = $("#suspended-user-list");
    
    $active.empty();
    $suspend.empty();
    for (var i = 0; i < users.length; i++){
        if (users[i].isActive){
            var $user = $('<li class="list-group-item">&nbsp;' + users[i].name + '<button class="list-users-right">Activate</button></li>');
            $user.data("name", users[i].name);
            $active.append($user);
        } else {
            var $user = $('<li class="list-group-item">&nbsp;' + users[i].name + '<button class="list-users-right">Suspend</button></li>');
            $user.data("name", users[i].name);
            $suspend.append($user);
        }
    }
};

