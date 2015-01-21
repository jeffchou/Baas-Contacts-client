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

		BaasContact.Models.Users.loadUsers();
    });
    
    $("#active-user-list").on("click", "button", function(e){
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
        
        BaasContact.Models.Users.suspendUser(name);
    });
    
    $("#suspended-user-list").on("click", "button", function(e){
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
        
		BaasContact.Models.Users.activateUser(name);
    });
}

BaasContact.Models.Users = (function() {
	var allUsers = {};
	var loadUsers = function () {
		 BaasBox.fetchUsers()
            .done(function(res){
            	
                // data
                allUsers = [];

                for (var i = 0; i < res.data.length; i++){
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
                    
                    var name = res.data[i].user.name; 
                    var user = {
                        name: name,
                        isActive: isActive
                    }
                    //allUsers.push(user);
                    allUsers[name] = user;
                }
                
                // view
                BaasContact.Views.Users.renderUsers(allUsers);
            })
            .fail(BaasContact.Views.Error.log);
	};
	var suspendUser = function(name) {
		BaasBoxEx.suspendUser(name)
	        .done(function(res){
	        	allUsers[name].isActive = false;
				//BaasContact.Views.Users.removeUser(name);
				BaasContact.Views.Users.renderUsers(allUsers);
	        })
	        .fail(BaasContact.Views.Error.log);
	};
	var activateUser = function(name) {
		BaasBoxEx.activateUser(name)
			.done(function(res){
	            allUsers[name].isActive = true;
	            //$user.remove().appendTo("#active-user-list").find("button").text("Active");
	            BaasContact.Views.Users.renderUsers(allUsers);
	        }).fail(BaasContact.Views.Error.log);
    };
	return {
		loadUsers: loadUsers,
		suspendUser: suspendUser,
		activateUser: activateUser
	};
})();

BaasContact.Views.Error = {};
BaasContact.Views.Error.log = function(err) {
	var errMsg = JSON.stringify(err);
	$.print(errMsg);
	$.notify(errMsg);
};

BaasContact.Views.Users = {
	renderUsers : function(users) {
	    var $active = $("#active-user-list"); 
	    var $suspend = $("#suspended-user-list");
	    
	    $active.empty();
	    $suspend.empty();

	    //for (var i = 0; i < users.length; i++){
    	for (var i in users) {
    		if (users.hasOwnProperty(i)) {
    			$.print(i);
		        if (users[i].isActive){
		            var $user = $('<li class="list-group-item">&nbsp;' + users[i].name + '<button class="list-users-right">Suspend</button></li>');
		            $user.data("name", users[i].name);
		            $active.append($user);
		        } else {
		            var $user = $('<li class="list-group-item">&nbsp;' + users[i].name + '<button class="list-users-right">Activate</button></li>');
		            $user.data("name", users[i].name);
		            $suspend.append($user);
		        }
		    }
	    }
	},
	removeUser : function(name) {
		$.print(res);
        $user.remove().appendTo("#suspended-user-list").find("button").text("Suspend");
	}
};