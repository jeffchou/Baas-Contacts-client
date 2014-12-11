var DEBUG = false;
var CONTACK_COLLECTION = "contacts";

$.print = function(msg, type) {
	if (typeof type !== "undefined")
		console.log(type, msg);
	else
		console.log(msg);
}

$(document).ready(function(){
	// start program here while the whole page is ready.
	$.print("hello contact user");
	
	// initial BaasBox
	// TODO: these should be decide in a config.
	BaasBox.setEndPoint("http://172.16.252.102:9000");
	BaasBox.appcode = "1234567890";
	
	// initail account
	var user = BaasBox.getCurrentUser();
	if (user) {
		loginSuccess(user);
	} else {
		logout();
	}
	if (DEBUG) {
		$.print("BaasBox.getCurrentUser() -> " + BaasBox.getCurrentUser());
	}
	
	registerContactsEvents();
	registerSigninEvents();
});


var loginSuccess = function(userInfo) {
	$("#signin-form").hide();
	$("#app").show();
	
	$("#account-name").text(user.username);
	
	loadContacts();
};

var logout = function() {
	$("#signin-form").show();
	$("#app").hide();
}

// load all
var loadContacts = function() {
	BaasBox.loadCollection(CONTACK_COLLECTION)
		.done(function(contacts) {
			$.print(contacts);
		})
		.fail(function(err) {
			alert("load contact failed");
				$.print("load contact failed");
				$.print(err);
		});
}

function registerContactsEvents() {
	// on add a new contact
	$("#cf-add").click(function(){
		var newContacts = {};
		
		// todo: verify form inputs.
		newContacts.employeeId = $("#cf-id").val();
		newContacts.name = $("#cf-name").val();
		newContacts.extNo = $("#cf-extno").val();
		newContacts.email = $("#cf-email").val();
		newContacts.mobileNo = $("#cf-mobileno").val();
		newContacts.birthDay = $("#cf-birth").val();
		newContacts.address = $("#cf-address").val();
		
		$.print(newContacts);
		
		// contacts
		BaasBox.save(newContacts, CONTACK_COLLECTION)
			.done(function(res) {
				$("#add-contact-form").modal('hide');
				// todo: refresh or add something.
			})
			.fail(function(err) {
				alert("add new contact failed");
				$.print("add new contact failed");
				$.print(err);
			});
	});
}

function registerSigninEvents() {
	if (DEBUG) {
		$("#inputAccount").val("admin");
		$("#inputPassword").val("admin");
		setTimeout(function(){
			$("#signin").click();
		}, 100);
	}
	
	$("#signin").click(function(e) {
		$("#signin-error-panel").hide();
		
		var user = $("#inputAccount").val(),
			password = $("#inputPassword").val();
			
		if (user == "" || password == "") return;
		
		e.preventDefault();
		
		BaasBox.login(user, password)
			.done(function(res) {
				loginSuccess(res);
			})
			.fail(function (err) {
				$("#signin-error-panel").fadeIn();
			});
	});
	
	$("#inputPassword").keyup(function(event){
		if(event.keyCode == 13){
			$("#signin").click();
		}
	});
	
	$("#signout").click(function(){
		BaasBox.login();
		logout();
	});
	
}

