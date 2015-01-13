"use strict";

var BaasContact = {};	// project namespace

var DEBUG = false;
var CONTACK_COLLECTION = "contacts";

$(document).ready(function() {
	// start program here while the whole page is ready.
	// similar to a "main" function.
	$.print("hello contact user");
	
	// initial BaasBox
	// TODO: these should be decide in a config.
	BaasBox.setEndPoint("http://172.16.252.102:9000");
	BaasBox.appcode = "1234567890";
	
	// initialize account
	var user = BaasBox.getCurrentUser();
	if (user) {
        loginSuccess(user);
	} else {
		logout();
	}
	if (DEBUG) {
		$.print("BaasBox.getCurrentUser() -> " + user);
	}
	
	registerContactsEvents();
	registerSigninEvents();
	registerUsersEvents();
    
	if (DEBUG) {
		initializeImport();

		//$('[data-toggle="tooltip"]').tooltip();
		$("#p-c-add").tooltip();

		// click to let all REGISTERED user access it
		$("#publish-contacts").tooltip().click(function () {
			BaasBox.loadCollection(CONTACK_COLLECTION)
				.done(function(contacts) {
					for (var i = 0; i < contacts.length; i++) {
						BaasBox.grantRoleAccessToObject(CONTACK_COLLECTION, contacts[i].id, BaasBox.READ_PERMISSION, BaasBox.REGISTERED_ROLE);
						BaasBox.grantRoleAccessToObject(CONTACK_COLLECTION, contacts[i].id, BaasBox.UPDATE_PERMISSION, BaasBox.REGISTERED_ROLE);
					}
				})
		});
	}

	if (DEBUG && !user) {
		$("#inputAccount").val("admin");
		$("#inputPassword").val("admin");

		$("#signin").click();
	}
});

BaasContact.Views = {};
BaasContact.Views.Users = {};
BaasContact.Views.Contacts = {};
BaasContact.Views.Posts = {};
BaasContact.Views.Profile = {};
BaasContact.Views.Notify = {};
BaasContact.Views.Modes = {};

BaasContact.Views.Notify.show = function(msg) {
	$("#message-sm").text(msg).fadeIn().delay(3500).fadeOut(function () {
		$("#message-sm").clearQueue();
	});
};

BaasContact.Views.Modes = (function() {
	// modes: 
	var States = {
		"App": {
			enter: function() {
				$("#app").show();
			},
			leave: function() {
				$("#app").hide();
			}
		},
		"Logon": {
			enter: function() {
				$("#signin-form").show();
			},
			leave: function() {
				$("#signin-form").hide();
			}
		}
	};

	var goApp = function() {
		this.gotoState("App");
	};

	var goLogon = function() {
		this.gotoState("Logon");
	};

	return {
		States: States,
		goApp: goApp,
		goLogon: goLogon
	};
})();
$.makeStateMachine(BaasContact.Views.Modes);

BaasContact.Views.Contacts = (function() {
	var show = function(){
		$("#main-feature>div").hide();
		$("#contacts-panel").show();
	};

	return {
		show: show
	};
})();

BaasContact.Views.Profile = (function() {
	var show = function(){
		$("#main-feature>div").hide();
		$("#profile-panel").show();
	};

	return {
		show: show
	};
})();

$("#nav-contacts").click(function() {
	BaasContact.Views.Contacts.show();
	loadAllContacts();
    
    
	var $this = $(this);
	$this.parent().find("li").removeClass('active');
	$this.addClass('active');
});

var showProfile = function() {
	BaasContact.Views.Profile.show();
    
	var $this = $(this);
	$this.parent().find("li").removeClass('active');
	$this.addClass('active');
}

$("#nav-profile").click(showProfile);

var loginSuccess = function(userInfo) {
	BaasContact.Views.Modes.goApp();
    
	$("#search-text").focus();
	$("#account-name").text(user.username);

	checkAndLoadMyProfile();
	$("#nav-profile").click();
    registerProfileEvents();
};

var userInfo;
var checkAndLoadMyProfile = function() {
    BaasBox.fetchCurrentUser()
        .done(function(res){
            if (res.result === "ok") {
                userInfo = res.data;
				// todo: cover user data by a Class
				userInfo.isAdmin = function() {
					var roles = this.user.roles;
					for (var i = 0; i < roles.length; i++) {
						if (roles[i].name == BaasBox.ADMINISTRATOR_ROLE) {
							return true;
						}
					}
					return false;
				};
                renderProfile(userInfo);
            } else {
                $.notify("Login error");
                $.print(data);
                logout();    
            }
        })
        .fail(function(){
            // an error of login
            $.notify("Your login has expired");
            logout();
        });
};

var logout = function() {
	BaasContact.Views.Modes.goLogon();
};

var composeContactHtml = (function(){
	var contactTmpl = $("#contact-tmpl").html();
	return doT.template(contactTmpl);
}());

var renderContact = function(contact) {
	var contactHtml = composeContactHtml(contact);
	var $contact = $(contactHtml).data("contact", contact);
	if (userInfo.isAdmin()) {	// todo: move it to other place
		if (!contact.userId) {
			$contact.find(".bind-user").show();
		} else {
			$contact.find(".user-info").addClass("active-user");
		}
	}
	return $contact;
};


//var renderContactForm = function(contact) {
//	var contactHtml = composeContactFormHtml(contact);
//	return $(contactHtml).data("contact", contact);
//}

var refreshContactsList = function(contacts) {
	var $contactsList = $("#contacts-list"),
		i = 0 ,
		$contact;
		
	$contactsList.empty();
	for ( ; i < contacts.length; i++) {
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
	BaasBox.loadCollection(CONTACK_COLLECTION)
		.done(function(contacts) {
			refreshContactsList(contacts);
		})
		.fail(function(err) {
			alert("load contact failed");
				$.print("load contact failed");
				$.print(err);
		});
};

var loadContacts = function() {
	var searchBy = $('input[name=optionsRadios]:checked', '#contacts-search-panel').val(),
		searchKey = $("#search-contacts-text").val();

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
};

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

	$("#search-contacts").click(function() {
		loadContacts();
	});

	$("#search-contacts-text").on("focus click", function(event) {
		$("#search-contacts-text").select();
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
	});
	
	// open add form 
	$("#c-add").click(function() {
		var contact = createBlankContact();
		putContactData(contact);
		$('#add-contact-form').modal({backdrop: "static"})
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
						alert("delete contact failed, msg: " + err.responseJSON.message);
						$.print("delete contact failed, msg: " + err.responseJSON.message);
						$.print(err);
					});
				$confirm.modal('hide');
			});
			return;
		}
		if ($target.is(".bind-user")) {
			var n = contact.name;
			var seed = n[0] + n[1] + n[2];
			seed = seed.toLowerCase();
			$.get("http://172.16.252.102:9000/users?where=any().toLowerCase()+like+%27%25" + seed + "%25%27")
				.done(function(res) {
					var users = res.data;
					if (users.length == 0) {

					}


				});
			return;
		}
		
		$.print(contact);
		putContactData(contact);
		$('#add-contact-form').modal({backdrop: "static"})
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

	});
}