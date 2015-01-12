"use strict";

var BaasContact = {};
var DEBUG = false;
var CONTACK_COLLECTION = "contacts";

$.print = function(msg, type) {
	if (typeof type !== "undefined")
		console.log(type, msg);
	else
		console.log(msg);
};

$.notify = function(msg) {
	$("#message-sm").text(msg).fadeIn().delay(3500).fadeOut(function () {
		$("#message-sm").clearQueue();
	 });
};

var loadHTML = function(url, element) {
	 jQuery.ajax({
         url:    url ,
		 dataType: 'text',
         success: function(result) {
                      if(result.isOk == false) {
                          $.print(result.message);
                      } else {
						element.html(result);
						//$('#target').html(result);
						//$.print(url+" element.html()="+element.html());
					  }
                  },
         async:   false
    });
}

$(document).ready(function(){
	$.print("ready start");
	// start program here while the whole page is ready.
	
	loadHTML("./signin.html",$("#signin_panel"));
	$.print("next signin_panel");
	
	loadHTML("./main_frame.html",$("#main_frame"));
	$.print("next main_frame");
	
	loadHTML("../VERSION",$("#version_info"));
	
	
	// initial BaasBox
	// TODO: these should be decide in a config.
	//BaasBox.setEndPoint("http://172.16.252.102:9000");
	BaasBox.setEndPoint("http://172.16.127.52:9000");
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
	
     $.print("registerContactsEvents start");
    
	registerContactsEvents();
	registerSigninEvents();
    
    $.print("registerSigninEvents finished DEBUG="+DEBUG);
	
	if (DEBUG) {
		//initializeImport();
	}

	if (DEBUG && !user) {
		$("#inputAccount").val("admin");
		$("#inputPassword").val("admin");

		//$("#signin").click();
	}

	registerUsersEvents();
	$.print("ready finished");
});


var loginSuccess = function(userInfo) {
	$("#signin-form").hide();

	$("#app").show(300, function(){
		$("#search-text").focus();
		//loadAllContacts();
		$("#menu_dashboard").click();
	});
	
	$("#account-name").text(user.username);
};

var logout = function() {
	
	 $.print("logout start");
	
	BaasBox.logout();
	
	$("#signin-form").show();
	$("#app").hide();
}

/*
var composeContactHtml = (function(){
	var contactTmpl = $("#contact-tmpl").html();
	//$.print("contactTmpl2="+contactTmpl);
	console.info("contactTmpl--"+contactTmpl);
	return doT.template(contactTmpl);
}());
*/

/*
var renderContact = function(contact) {
	var contactHtml = composeContactHtml(contact);
	return $(contactHtml).data("contact", contact);
}
*/

var composeContactHtml = function(){
	var contactTmpl = $("#contact-tmpl").html();
	return doT.template(contactTmpl);
}

var renderContact = function(contact) {
	///$.print("renderContact...contact="+JSON.stringify(contact));
	var contactHtml = composeContactHtml(contact);
	var html= contactHtml(contact);
	var returnVal=$(html).data("contact", contact);
	return returnVal;
}

var refreshContactsList = function(contacts) {
	$.print("refreshContactsList...");
	var $contactsList = $("#contacts-list"),
		i = 0,
		$contact;
		
	$contactsList.empty();
	for (; i < contacts.length; i++) {
		$contact = renderContact(contacts[i]);
		$contactsList.append($contact);
	}
};

var getSearchField = function() {
	$("#contact-filter input[name='optionsRadios']")
	$( "input[n='Hot Fuzz']" ).next().text( "Hot Fuzz" );
};

// load all
var loadAllContacts = function() {
	$.print("loadAllContacts...");
	BaasBox.loadCollection(CONTACK_COLLECTION)
		.done(function(contacts) {
			console.info("contacts="+contacts);
			refreshContactsList(contacts);
		})
		.fail(function(err) {
			alert("load contact failed");
				$.print("load contact failed");
				$.print(err);
		});
}

var loadContacts = function() {
	$.print("loadContacts...");
	var searchBy = $('input[name=optionsRadios]:checked', '#contact-filter').val(),
		searchKey = $("#search-text").val();
		
	$.print(searchBy);
	$.print(searchKey);
	
	if (searchKey === "") {
		loadAllContacts();
		return;
	}
	
	var searchFiled = "";
	switch(searchBy) {
	case "by-name": 
		searchFiled = "name";
		break;
	case "by-department": 
		searchFiled = "department";
		break;
	case "by-all": 
		searchFiled = "any()";
		break;
	default:
		searchFiled = "any()";
		break;
	}
	
	searchKey = searchKey.toLowerCase();
	
	var condition = searchFiled + ".toLowerCase()+like+" + encodeURIComponent("\'%" + searchKey + "%\'") + "";
	var url = BaasBox.endPoint + "/document/" + CONTACK_COLLECTION + "?where=" + (condition);
																//   "?skip=0&page=0&recordsPerPage=10&where=" + (condition);
	$.ajax((url))
		.done(function(res) {
			refreshContactsList(res.data);
		})
		.fail(function(err) {
			alert("load contact failed");
				$.print("load contact failed");
				$.print(err);
		});
}

function createBlankContact() {
	return {
		employeeId: 0,
		name: "",
		department : "",
		extNo: "",
		email: "",
		mobileNo: "",
		birthDay: "",
		address: ""
	};
};

function registerContactsEvents() {
	
	$("#search").click(function() {
		loadContacts();
	});

	$("#search-text").on("focus click", function(event) {
		$("#search-text").select();
	});

	var composeContactFormHtml = doT.template($("#contact-form-tmpl").html());	
	
	var putContactData = function(contact) {

		var contactFormHtml = composeContactFormHtml(contact);
		$("#edit-contact-form").empty().append(contactFormHtml);
	};
	var fillFromToContact = function(contact) {
		contact.employeeId = $("#cf-id").val();
		contact.name = $("#cf-name").val();
		contact.department  = $("#cf-department").val();
		contact.extNo = $("#cf-extno").val();
		contact.email = $("#cf-email").val();
		contact.mobileNo = $("#cf-mobileno").val();
		contact.birthDay = $("#cf-birth").val();
		contact.address = $("#cf-address").val();
	};
	
	$('#add-contact-form').on('show.bs.modal', function (e) {
		//debugger;
	})
	
	// open add form 
	$("#c-add").click(function() {
		var contact = createBlankContact();
		putContactData(contact);
		$('#add-contact-form').modal()
			.find(".modal-title").text("Add New Contact");
		
		$("#cf-save").off().click(function(e) {
			// todo: verify form inputs.
			fillFromToContact(contact);
			
			e.preventDefault();
			
			BaasBox.save(contact, CONTACK_COLLECTION)
				.done(function(res) {
					$("#add-contact-form").modal('hide');
					// todo: refresh or add something.
					loadContacts();
				})
				.fail(function(err) {
					alert("add new contact failed");
					$.print("add new contact failed");
					$.print(err);
				});
		});
	});
	
	// open edit form
	$("#contacts-list").on("click", "div.row", function(e) {
		var contact = $(this).data("contact");
		var $target = $(e.target);
		if ($target.is(".delete-contact")) {
			// ugly
			var $confirm = $("#delete-contact-confirm").modal();
			$("#delete-contact").off().on("click", function() {
				//contact
				BaasBox.deleteObject(contact.id, CONTACK_COLLECTION)
					.done(function(res) {
						$("#add-contact-form").modal('hide');
						// todo: refresh or add something.
						loadContacts();
					})
					.fail(function(err) {
						alert("delete contact failed");
						$.print("delete contact failed");
						$.print(err);
					});
				$confirm.modal('hide');
			});
			return;
		}
		
		putContactData(contact);
		$('#add-contact-form').modal()
			.find(".modal-title").text("Edit Contact");
		
		$("#cf-save").off().click(function(e) {
			// todo: verify form inputs.
			fillFromToContact(contact);
			
			e.preventDefault();
			
			BaasBox.save(contact, CONTACK_COLLECTION)
				.done(function(res) {
					$("#add-contact-form").modal('hide');
					// todo: refresh or add something.
					loadContacts();
				})
				.fail(function(err) {
					alert("add new contact failed");
					$.print("add new contact failed");
					$.print(err);
				});
		});
	})
	.on("mouseover", "div.row", function(e) {
		$(this).tooltip();
	});
}


function registerSigninEvents() {
	$("#signin").click(function(e) {
		$("#signin-error-panel").hide();
		
		console.info("registerSigninEvents enter..");
		
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
	
	$("#logout").click(function(e){
		BaasBox.logout();
		logout();
	});
	
	$("#settings").click(function(e){
		console.info("settings");
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
	
	
	$("#menu_dashboard").click(function(event) {
		$.print("menu_dashboard clicked");
	});
	
	$("#menu_contacts").click(function(event) {
		$.print("menu_contacts clicked");
		loadAllContacts();
	});
	
}


