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
	
	if (DEBUG) {
		initializeImport();
	}
});


var loginSuccess = function(userInfo) {
	$("#signin-form").hide();
	$("#app").show();
	
	$("#account-name").text(user.username);
	
	loadAllContacts();
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
	
	if (searchKey == "") {
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
	}
	
	// http://172.16.252.102:9000/document/contacts?page=0&recordsPerPage=50
	//BaasBox.loadCollectionWithParams(CONTACK_COLLECTION, {page: 0, recordsPerPage: BaasBox.pagelength})
	//GET /link?where=in.name.toLowerCase() like 'john%' and label="customer"
	//name.toLowerCase()%20like%20%27john%25%27%20and%20label%3D%27customer%27
	$.ajax(BaasBox.endPoint + '/document/contacts?page=0&recordsPerPage=50&' + searchFiled + ' like ' + "'%" + searchKey +"%'")
		.done(function(contacts) {
			refreshContactsList(contacts);
		})
		.fail(function(err) {
			alert("load contact failed");
				$.print("load contact failed");
				$.print(err);
		});
}

function registerContactsEvents() {
	
	$("#search").click(function() {
		loadContacts();
	});
	
	var createBlankContact = function() {
		return { 
			employeeId: "",
			name: "",
			extNo: "",
			email: "",
			mobileNo: "",
			birthDay: "",
			address: ""
		};
	};
	var composeContactFormHtml = doT.template($("#contact-form-tmpl").html());
	var putContactData = function(contact) {
		var contactFormHtml = composeContactFormHtml(contact);
		$("#edit-contact-form").empty().append(contactFormHtml);
	};
	var fillFromToContact = function(contact) {
		contact.employeeId = $("#cf-id").val();
		contact.name = $("#cf-name").val();
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

function initializeImport() {
	// later
	// $("#p-c-add").show();
}