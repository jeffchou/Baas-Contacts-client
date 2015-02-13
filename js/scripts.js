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
	BaasBox.setEndPoint("http://172.16.127.52:9000");
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
	registerPersonEvents();
    registerCollectionEvents();
    registerAPIEvents();
    
    initializeSocialNetwork();
    
    BaasContact.Views.Collections.initial();
    BaasContact.Views.Administrator.initial();
    
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

		setTimeout(function () {
			// $("#API-settings").click();
		}, 1500);
	}
});

BaasContact.Views = {};
BaasContact.Views.Users = {};
BaasContact.Views.Contacts = {};
BaasContact.Views.Posts = {};
BaasContact.Views.Profile = {};
BaasContact.Views.Notify = {};
BaasContact.Views.Modes = {};

BaasContact.Models = {};
BaasContact.Models.Users = {}; 

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
		},
        "ChangePassword": {
            enter: function() {
				$("#change-password-form").show();
			},
			leave: function() {
				$("#change-password-form").hide();
			}
		},
        "ChangeUsername": {
            enter: function() {
				$("#change-username-form").show();
			},
			leave: function() {
				$("#change-username-form").hide();
			}
		},
        "ListUsers": {
            enter: function() {
				$("#list-user-form").show();
			},
			leave: function() {
				$("#list-user-form").hide();
			}
		},
        "Collections":{
            enter: function() {
				$("#collection-form").show();
			},
			leave: function() {
				$("#collection-form").hide();
			}
        },
        "RESTAPIAccess":{
            enter: function() {
				$("#REST-API-access-form").show();
			},
			leave: function() {
				$("#REST-API-access-form").hide();
			}
        },
        "APISettings":{
            enter: function() {
				$("#API-setting-form").show();
			},
			leave: function() {
				$("#API-setting-form").hide();
			}
        }
	};

	var goApp = function() {
		this.gotoState("App");
	};

	var goLogon = function() {
		this.gotoState("Logon");
	};
    
    var goChangePassword = function() {
		this.gotoState("ChangePassword");
	};
    
    var goChangeUsername = function() {
		this.gotoState("ChangeUsername");
	};
    
    var goListUsers = function() {
		this.gotoState("ListUsers");
    };

    var goCollections = function() {
        this.gotoState("Collections");
    };
    
    var goRESTAPIAccess = function() {
        this.gotoState("RESTAPIAccess");
    };

    var goAPISettings = function() {
        this.gotoState("APISettings");
    };

	return {
		States: States,
		goApp: goApp,
		goLogon: goLogon,
        goChangePassword: goChangePassword,
        goChangeUsername: goChangeUsername,
        goListUsers     : goListUsers,
        goCollections   : goCollections,
        goRESTAPIAccess : goRESTAPIAccess,
        goAPISettings   : goAPISettings
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
//simon-change password start
$("#change-password").click(function() {
    
    BaasContact.Views.Modes.goChangePassword();
    /*
    $("#signin-form").hide();
    $("#app").hide();
    $("#change-password-form").fadeIn();*/
    $("#change-password-old").val("");
    $("#change-password-new").val("");
});

$("#change-password-btn").click(function(event) {    
    BaasBox.changePassword($("#change-password-old").val(), $("#change-password-new").val())
		.done(function(res) {
			$("#change-password-form").hide();
			logout();
			$.notify("Your password is changed, please signin again");

			$.print("change password success");
		})
		.fail(function(err){
			alert("password isn't correct");
			$.print("change password fail");
		});
});

$("#cancel-btn").click(function(event) {
    BaasContact.Views.Modes.goApp();
    $("#change-password-form").hide();
});
//simon-change password end
var showProfile = function() {
	BaasContact.Views.Profile.show();
    
	var $this = $(this);
	$this.parent().find("li").removeClass('active');
	$this.addClass('active');
}

$("#nav-profile").click(showProfile);

var loginSuccess = function(userInfo) {

	$.print("# loginSuccess");
	BaasContact.Views.Modes.goApp();
    
	$("#search-text").focus();
    BaasContact.Views.Person.renderAccountName(userInfo.username);
    BaasContact.Models.Person.loadMySelf();
	
	$("#nav-profile").click();
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
	if (BaasContact.Models.Person.getMySelf().isAdmin()) {	// todo: move it to other place
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

function initializeSocialNetwork() {
    $("#fb-login").attr("disabled", true);
	
    // fb init
    (function (d) {
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);

        id = 'google-jssdk'
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');

        js.onload = function(){
            // $rootScope.$broadcast("google_init");
            $.print("google_init");
        };
        js.type = 'text/javascript'; js.async = true;
        js.src = 'https://plus.google.com/js/client:plusone.js';

        ref.parentNode.insertBefore(js, ref);

        $.notify("Downloading social SDK");
    }(document));

    var facebookAppId = 1592726380958208;
    var googleAppId = "935727006819-m0te52af154qlfaqphelv6ts06g4pir5.apps.googleusercontent.com";

    // global function for fb
    window.fbAsyncInit = function () {
        var baseServerUrl = "http://172.16.127.52:9000\:9000";
        var baseClientUrl = "http://172.16.127.52:8000\:8000";

        $.notify("Initial Facebook SDK... ");

        FB.init({
            appId: facebookAppId,
            channelUrl: baseClientUrl+'/channel.html',
            status     : false, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            redirectUri: baseServerUrl+'/social/login/facebook/callback?appcode=1234567890',
            //redirectUri: baseServerUrl,
            xfbml:true
        });

        // $rootScope.$broadcast("facebook_init");
        FB.Event.subscribe('auth.statusChange', function(response) {
            $.print(response);
            //$.print(response);
            //$rootScope.$broadcast("fb_statusChange", {'response': response});
        });

        $("#fb-login").attr("disabled", false);
    };
        
    // Login a User with a specified social network: Facebook
    $("#fb-login").tooltip().click(function () {
        $.notify("log in with facebook ...");
        FB.login(function (response) {
            if (response.status === 'connected') {
                var token = response.authResponse.accessToken;
                //$scope.logincb(token,'facebook',isLink);
                $.print("fb logged in, token: " + token);

                BaasBoxEx.loginSocialNetwork("facebook", token)
                    .done(function (res) {
                        $.notify("fb login success, 1 second");
                        BaasBox.handleLogin(res);
                    	setTimeout(function(){
                        	loginSuccess(BaasBox.getCurrentUser());
                        }, 1000);
                        
                    })
                    .fail(function(err){
                        var info = JSON.parse(err.responseText);
                        var message = info.message;

                        $.notify("Error on fb link: " + message);
                        $.print(err);
                    });
            }
        });
    });
    
    $("#link-facebook").click(function(){
        $.notify("Linking with facebook ...");
        FB.login(function (response) {
            if (response.status === 'connected') {
                var token = response.authResponse.accessToken;
                //$scope.logincb(token,'facebook',isLink);
                $.print("fb logged in, token: " + token);

                BaasBoxEx.linkSocialNetwork("facebook", token)
                    .done(function (res) {
                        $.notify("facebook linked");
                    })
                    .fail(function(err){
                        var info = JSON.parse(err.responseText);
                        var message = info.message;

                        $.notify("Error on fb link: " + message);
                        $.print(err);
                    });
            }
        });
    });
    
    
    var socialEditor = CodeMirror.fromTextArea($("#social-network-output")[0]);
    $("#social-network").click(function() {
        $('#social-network-form').modal({backdrop: "static"});
        getSocialNetwork();
    });
    
    var getSocialNetwork = function(){
        BaasBoxEx.getSocialNetworkConnections()
            .done(function (res) {
                $.print(res);

                if (res.result === "ok") {
                    //socialEditor.setValue(JSON.stringify(res.data));
                    //$.print(socialEditor.getValue());
                    //$.beautify(socialEditor);
                    socialEditor.setValue($.jsBeautify(res.data));
                } else {
                    $.notify("get SocialNetwork with some problem: ");
                    socialEditor.setValue(JSON.stringify(res));
                    $.beautify(socialEditor);
                    //socialEditor.setValue($.jsBeautify(res));
                }
            })
            .fail(function (res) {
                if (res.status == 404) {
                    $.notify("You don't have a link to any social network");
                    socialEditor.setValue("You don't have a link to any social network");
                } else {
                    $.notify("get SocialNetwork with some error: ");
                    socialEditor.setValue("");
                }
                $.print(res);
            });
    }
    
    $("#unlink-facebook").click(function(){
        BaasBoxEx.unlinkSocialNetwork("facebook")
            .done(function (res) {
                $.print(res);
                $.notify("unlinked facebook");
                // getSocialNetwork();
            })
            .fail(function(err) {
                socialEditor.setValue($.jsBeautify(err));
                var errInfo = JSON.parse(err.responseText);
                var errMsg = errInfo.message;
                $.print(errMsg);
                $.notify(errMsg);
            });
    });
    
    $("#refresh-social-network").click(function(){
        getSocialNetwork();
    });

    // Google..................................

    $("#google-login").click(function() {
    	gapi.auth.authorize({
    		"client_id": googleAppId,
			"scope":
				[
				"https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/plus.me",
				"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"
				]
			}, 
			function(t) {
				//$scope.logincb(t["access_token"],'google',isLink);
				
                var token = t.access_token;
                $.print("Google logged in, token: " + token);

                BaasBoxEx.loginSocialNetwork("google", token)
                    .done(function (res) {
                        $.notify("google login success");
                        BaasBox.handleLogin(res);
                        loginSuccess(BaasBox.getCurrentUser());                        
                    })
                    .fail(function(err){
                        var info = JSON.parse(err.responseText);
                        var message = info.message;

                        $.notify("Error on google link: " + message);
                        $.print(err);
                    });
			}
		);
    });

	$("#link-google").click(function(){
        gapi.auth.authorize({
    		"client_id": googleAppId,
			"scope":
				[
				"https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/plus.me",
				"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"
				]
			}, 
			function(t) {
				var token = t.access_token;
                BaasBoxEx.linkSocialNetwork("google", token)
                    .done(function (res) {
                        $.notify("google linked");
                    })
                    .fail(function(err){
                        var info = JSON.parse(err.responseText);
                        var message = info.message;

                        $.notify("Error on google link: " + message);
                        $.print(err);
                    });
            }
        );
    });

    $("#unlink-google").click(function(){
        BaasBoxEx.unlinkSocialNetwork("google")
            .done(function (res) {
                $.print(res);
                $.notify("unlinked google");
            })
            .fail(function(err) {
                socialEditor.setValue($.jsBeautify(err));
                var errInfo = JSON.parse(err.responseText);
                var errMsg = errInfo.message;
                $.print(errMsg);
                $.notify(errMsg);
            });
    });
}