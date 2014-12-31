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
	$("#message-sm").text(msg).fadeIn().delay(3000).fadeOut(function () {
		$("#message-sm").clearQueue();
	});
};

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
	
	if (DEBUG) {
		initializeImport();
	}

	if (DEBUG && !user) {
		$("#inputAccount").val("admin");
		$("#inputPassword").val("admin");

		//$("#signin").click();
	}

	registerUsersEvents();
});


var loginSuccess = function(userInfo) {
	$("#signin-form").hide();

	$("#app").show(300, function(){
		$("#search-text").focus();
		loadAllContacts();
	});
	
	$("#account-name").text(user.username);
};

var logout = function() {
	$("#signin-form").show();
	$("#app").hide();
}

var composeContactHtml = (function(){
	var contactTmpl = $("#contact-tmpl").html();
	return doT.template(contactTmpl);
}());

var renderContact = function(contact) {
	var contactHtml = composeContactHtml(contact);
	return $(contactHtml).data("contact", contact);
}


//var renderContactForm = function(contact) {
//	var contactHtml = composeContactFormHtml(contact);
//	return $(contactHtml).data("contact", contact);
//}

var refreshContactsList = function(contacts) {
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
	BaasBox.loadCollection(CONTACK_COLLECTION)
		.done(function(contacts) {
			refreshContactsList(contacts);
		})
		.fail(function(err) {
			alert("load contact failed");
				$.print("load contact failed");
				$.print(err);
		});
}

var loadContacts = function() {
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
		$.print(this);
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