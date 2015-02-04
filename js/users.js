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
			.fail(function () {
				$("#signin-error-panel").fadeIn();
			});
	});
	
	$("#signout").click(function(){
		BaasBox.logout();
		logout();
	});
}

function registerRESTAPIaccessEvents(){
    $("#REST-API-access").click(function() {
        BaasContact.Views.Modes.goRESTAPIAccess();
        BaasContact.Models.Administrator.listGroups();
    });
    
    $("#read-specific-btn").click(function() {
        BaasContact.Models.Administrator.readSpecificGroup($("#specific-key").val());
    });
    
    $("#Enable-EPG-btn").click(function() {
        BaasContact.Models.Administrator.enableAnEndpointGroup($("#specific-key").val());
    });
    
    $("#Disable-EPG-btn").click(function() {
        BaasContact.Models.Administrator.disableAnEndpointGroup($("#specific-key").val());
    });
}

function registerCollectionEvents(){
    $("#collection").click(function() {
        BaasContact.Views.Modes.goCollections();
        BaasContact.Models.Collections.getCollections();
    });
    
    $("#collection-list").on("click","li", function() {
        var collection_name = $(this).data("collection");
        BaasContact.Models.Collections.countDocuments(collection_name);
        BaasContact.Views.Collections.showCurrentCollection(collection_name);
        BaasContact.Models.Collections.loadAllDocuments(collection_name);
        $.print(collection_name);
    });
    
    $("#grant-object-btn").click(function(){
        var collection = $("#collection-name").text(),
            documentId = $("#aco-document").val(),
            permission = $("#aco-permission").val(),
            permissionOn = $('input[name=permissions-on]:checked', '#access-control-on-object').val(),
            target = $("#aco-target").val();
        
        BaasContact.Models.Collections.grantAccessToObject(collection, documentId, permission, permissionOn, target);
    });
    
    $("#revoke-object-btn").click(function(){
        var collection = $("#collection-name").text(),
            documentId = $("#aco-document").val(),
            permission = $("#aco-permission").val(),
            permissionOn = $('input[name=permissions-on]:checked', '#access-control-on-object').val(),
            target = $("#aco-target").val();
        
        BaasContact.Models.Collections.revokeAccessToObject(collection, documentId, permission, permissionOn, target);
    });
 
    
    $("#update-field-btn").click(function(){
        var collection = $("#collection-name").text(),
            documentId = $("#acf-document").val(),
            fieldname = $("#acf-name").val(),
            data = $("#acf-data").val();
        
        BaasContact.Models.Collections.updateField(collection, documentId, fieldname, data); 
    });

    $("#add-collection-btn").click(function() {
        //var newCollectionName = $("#new-collection-username").val();
        //$.print(newCollectionName);
        BaasContact.Models.Collections.addCollection($("#new-collection-username").val());
    });

    $("#del-collection-btn").click(function() {
        BaasContact.Models.Collections.deleteCollection($("#new-collection-username").val());
    });
}

function registerUsersEvents() {
	$("#signup-gate").click(function() {
		$("#signin-error-panel").hide('slideUp');
		$("#signin-form").fadeOut(function() {
			$("#signup-form").fadeIn();
		});
	});

	$("#signin-gate").click(function() {
		$("#signin-error-panel").hide('slideUp');
		$("#signup-form").fadeOut(function() {
			$("#signin-form").fadeIn();
		});
	});

	// TODO: check need refactory to one place
	$("#new-account").on("change", function(){
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
				email: $("#new-email").val()
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
			});
	});

    $("#forgot-password").click(function () {
        var user = $("#inputAccount").val();

		$("#reset-password-confirm").modal();
		$("#reset-password-account").val(user);
	});

	$("#reset-password").click(function() {
		var user = $("#reset-password-account").val();
		// same as BaasBox.resetPassword();
		$.get(BaasBox.endPoint + '/user/' + user + '/password/reset')
			.done(function() {
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
    
    $("#user-list").click(function() {
        BaasContact.Views.Modes.goListUsers();
		BaasContact.Models.Users.loadUsers();
    });
    
    $("#active-user-list").on("click", "button", function(){
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
        BaasContact.Models.Users.suspendUser(name);
    });
    
    $("#suspended-user-list").on("click", "button", function(){
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
		BaasContact.Models.Users.activateUser(name);
    });
    
    $("#active-user-list, #suspended-user-list").on("click", "a", function() {
        var $user = $(this).closest("li");
        $.print($user.data());
        var name = $user.data("name");
        BaasBox.fetchUserProfile(name)
            .done(function(res){
                if (res.result === "ok") {
                    var person = new BaasContact.Models.Person.Person(res.data);
                    BaasContact.Views.Person.renderPerson(person);
                }
                $.print(res);
            })              
            .fail(BaasContact.Views.Error.log);
            
        BaasContact.Views.Modes.goApp();
    });

    $("#change-username").click(function() {
        BaasContact.Views.Modes.goChangeUsername();
    });
    
    $("#change-username-btn").click(function() {
        var newUser = $("#chagne-new-username").val();
        BaasContact.Models.Users.changeUserName(newUser);
        BaasContact.Views.Modes.goApp();
    });
    
    $("#change-password-form-cancel-btn, #change-username-form-cancel-btn, #exit-user-list-btn, #exit-collections-btn, #exit-REST-API-access-btn")
    .click(function() {
        BaasContact.Views.Modes.goApp();
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

                    //allUsers.push(user);
                    allUsers[name] = {
                        name: name,
                        isActive: isActive
                    };
                }
                
                // view
                BaasContact.Views.Users.renderUsers(allUsers);
            })
            .fail(BaasContact.Views.Error.log);
	};

	var suspendUser = function(name) {
		BaasBoxEx.suspendUser(name)
	        .done(function(){
	        	allUsers[name].isActive = false;
				BaasContact.Views.Users.renderUsers(allUsers);
	        })
	        .fail(BaasContact.Views.Error.log);
	};

	var activateUser = function(name) {
		BaasBoxEx.activateUser(name)
			.done(function(){
	            allUsers[name].isActive = true;
	            BaasContact.Views.Users.renderUsers(allUsers);
	        })
            .fail(BaasContact.Views.Error.log);
    };

    var changeUserName = function(name) {
        BaasBoxEx.changeUserName(name)
            .done(function(){
	            $.print("change name success");
	        }).fail(BaasContact.Views.Error.log);
    };
    
	return {
		loadUsers:        loadUsers,
		suspendUser:      suspendUser,
		activateUser:     activateUser,
        changeUserName:   changeUserName
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
                var $user;
		        if (users[i].isActive){
		            $user = $('<li class="list-group-item"><a>&nbsp;'+users[i].name + '</a><button class="list-users-right">Suspend</button></li>');
		            $user.data("name", users[i].name);
		            $active.append($user);
		        } else {
		            $user = $('<li class="list-group-item"><a>&nbsp;' + users[i].name + '</a><button class="list-users-right">Activate</button></li>');
		            $user.data("name", users[i].name);
		            $suspend.append($user);
		        }
		    }
	    }
	}
};

// person controller (?
var registerPersonEvents = function() {
    var View = BaasContact.Views.Person;

    var $upload = $("#upload-face-img");
    $upload.hover(
        function() {
            $(this).find("div.float-buttom").fadeTo(200, 0.5);
        },function() {
            $(this).find("div.float-buttom").fadeTo(200, 0.0);
        });

    $upload.find("input").on("change", function(e) {
        var files = e.target.files;
        if (files.length < 0) return;
        var file = files[0];
        if (!file.type.match('image.*')) {
            $.notify("file [" + file.name + "] is not a image");
            return;
        }

        $.notify("Uploading " + file.name + "...");

        var formData = new FormData();
        formData.append("upload", file);

        BaasContact.Models.Person.updatePersonalPortrait(formData);
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
    });

    $("#edit-person").click(function() {
        var Models = BaasContact.Models,
            me = Models.Person.getMySelf(),
            contactId = me.getContactId();

        if (typeof contactId !== "undefined") {
            Models.Contacts.getContact(contactId, function (contact) {
                View.showEditPersonForm(me, contact);
            });
        } else {
            //contact = Models.Contacts.createBlankContact();
            $.notify("???: this user is lack of contact");
        }
    });

    $("#pf-save").click(function() {
        var contact = {};
        contact.employeeId = parseInt($("#pf-id").val(), 10);
        contact.name = $("#pf-name").val();
        contact.department  = $("#pf-department").val();
        contact.extNo = $("#pf-extno").val();
        contact.email = $("#pf-email").val();
        contact.mobileNo = $("#pf-mobileno").val();
        contact.birthDay = $("#pf-birth").val();
        contact.address = $("#pf-address").val();

        var Models = BaasContact.Models;
        var me = Models.Person.getMySelf();
        me.setEmail(contact.email);
        me.setName(contact.name);

		contact.Id = me.getContactId();

		// todo: bad api, not consistence
		Models.Person.updatePublicInfo(contact);
    });

    $("#pf-cancel").click(function () {
        View.showPerson();
    });
};


BaasContact.Models.Person = (function () {
    // class Person
    var Person = function(data) {
        this.data = data;
    };

    var PersonPrototype = Person.prototype;
    PersonPrototype.isAdmin = function() {
        var roles = this.data.user.roles;
        for (var i = 0; i < roles.length; i++) {
            if (roles[i].name == BaasBox.ADMINISTRATOR_ROLE) {
                return true;
            }
        }
        return false;
    };

    PersonPrototype.hasPublicInfo = function() { return !!this.data.visibleByAnonymousUsers; };
    PersonPrototype.setPortrait = function(imgId) {
        this.data.visibleByAnonymousUsers.portraitImg = imgId;
    };
    PersonPrototype.getPortrait = function() { return this.data.visibleByAnonymousUsers.portraitImg; };
    PersonPrototype.getContactId = function () { return this.data.visibleByAnonymousUsers.contactId; };
	PersonPrototype.setContactId = function (contactId) { this.data.visibleByAnonymousUsers.contactId = contactId; };
    PersonPrototype.getName = function() { return this.data.visibleByTheUser.name; };
    PersonPrototype.setName = function(name) { this.data.visibleByTheUser.name = name; };
    PersonPrototype.getEmail = function() { return this.data.visibleByTheUser.email; };
    PersonPrototype.setEmail = function(email) { this.data.visibleByTheUser.email = email; };
    PersonPrototype.getAccount = function() { return this.data.user.name; };

    // data
    var me = new Person();
    
    // methods
    var loadMySelf = function(){
        BaasBox.fetchCurrentUser()
            .done(function(res){
                if (res.result === "ok") {
                    var person = new Person(res.data);
                    setMySelf(person);
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

    var bindContact = function() {
        if (me.hasPublicInfo() && typeof me.getContactId() === "undefined") {
            var info = {
                email: me.getEmail(),
                name: me.getName()
            };
            BaasContact.Models.Contacts.createContact(info)
                .done(function(res) {
					me.setContactId(res.id);
                    _updateMySelf();
                })
                .fail(function(error){
                    var info = JSON.parse(error.responseText);
                    var message = info.message;
                    $.notify("Error on create contact. message: " + message);
                });
        }
    };

    var setMySelf = function(person){
        me = person;
        bindContact();
        BaasContact.Views.Person.renderPerson(me);
    };
    
    var _updateMySelf = function() {
		$.print("# _updateMySelf");
        return BaasBox.updateUserProfile(me.data);
    };
    
    var updatePersonalPortrait = function(formData) {
        _uploadPublicFile(formData)
            .done(function(res) {
                var info = JSON.parse(res);
                var imgId = info.data.id;
                
                me.setPortrait(imgId);
                return _updateMySelf();
            })
            .done(function(){
                BaasContact.Views.Person.showPortraitImg(me.getPortrait());
            })
            .fail(function(error){
                var info = JSON.parse(error.responseText);
                var message = info.message;

                $.notify("Error on uploading image. message: " + message);
                $.print("-----------------");
                $.print("error: ");
                $.print(error);
                $.print("info: ");
                $.print(info);
            });
    };

	var updatePublicInfo = function(contact){
		_updateMySelf()
			.done(function(res) {
				$.print("# before update contact");
				return BaasContact.Models.Contacts.updateContact(contact);
			})
			.done(function () {
				var View = BaasContact.Views.Person;
				View.renderPerson(me);
				View.showPerson();
			})
			.fail(function(err){
				var info = JSON.parse(err.responseText);
				var message = info.message;

				$.notify("Error on updating public person info and contact. Error message: " + message);
			});
	};

    var _uploadFile = function (formData) {
        return BaasBox.uploadFile(formData);
    };
    
    var _uploadPublicFile = function (formData) {
        var publicSetting = {
          "read": {
              "roles": [BaasBox.ANONYMOUS_ROLE]
          }
        };
        formData.append("acl", JSON.stringify(publicSetting));
        formData.append("attachedData", "");    // this is for prevent BassBox bug.
        return _uploadFile(formData);
    };
    
    var getMySelf = function() { return me; };
    
    return {
        loadMySelf: loadMySelf,
        getMySelf: getMySelf,
        updatePersonalPortrait: updatePersonalPortrait,
        Person: Person,
		updatePublicInfo: updatePublicInfo
    };
}());

BaasContact.Views.Person = (function () {
    var renderAccountName = function(name){
        $("#account-name").text(name);
    };

    var showPortraitImg = function(imgId){
        if (!imgId) return;

        // todo: get it through Model or repository
        BaasBox.fetchFile(imgId, true)
            .done(function(){
                $("#profile-face-thumb img").attr("src", this.url);
            });
    };

    var _clearPortraitImg = function() {
        $("#profile-face-thumb img").attr("src", "");
    };

    var renderPerson = function(person) {
        // todo use class Person's methods
        var personInfo = person.data;

        $("#profile-name").text(personInfo.user.name);
        $("#profile-intro").text(personInfo.user.intro);

        var joinDate = new Date(personInfo.signUpDate);
        $("#prfile-join-date").text(joinDate.toLocaleDateString());

        if (person.hasPublicInfo() && (typeof person.getPortrait() !== "undefined")) {
            showPortraitImg(person.getPortrait());
        } else {
            _clearPortraitImg();
        }

        var rawInfo = {};
        var key;
        for(key in personInfo) {
            if (key.indexOf("visibleBy") > -1) {
                $.extend(rawInfo, personInfo[key]);
            }
        }
        var text = "<p>";
        for(key in rawInfo) {
            text += key + " : " + rawInfo[key] + " <br />";
        }
        text += "</p>";
        $("#profile-intro").html(text);
    };

    var showEditPersonForm = function (person, contact) {
        // 'person' is not used yet.
        // todo
        // renderPersonalEditForm(person);

        renderContactEditForm(contact);
        showEditPersonPanel();
    };

    var composeContactEditFormHtml = (function(){
        var contactTmpl = $("#person-form-tmpl").html();
        return doT.template(contactTmpl);
    }());

    var renderContactEditForm = function(contact){
        var editorString = composeContactEditFormHtml(contact);
        $("#edit-profile-panel>div:first").empty().append(editorString);
    };

    var showEditPersonPanel = function(){
        $("#edit-profile-panel").show();
        $("#profile-panel").hide();
    };
    var showPersonPanel = function () {
        $("#edit-profile-panel").hide();
        $("#profile-panel").show();
    };

    return {
        renderAccountName: renderAccountName,
        renderPerson: renderPerson,
        showPortraitImg: showPortraitImg,
        showEditPersonForm: showEditPersonForm,
        showPerson: showPersonPanel
    };
}());


BaasContact.Models.Collections = (function() {
    var collections = [];

    var _saveAllCollections = function(data) {
        collections = [];
        for(var i = 0; i < data.data.collections_details.length; i++) {
            collections[i] = data.data.collections_details[i].name;
        }
        BaasContact.Views.Collections.refreshCollections();
        BaasContact.Views.Collections.renderCollections(collections);
    };

    var getCollections = function() {
        BaasBoxEx.getCollections()
            .done(function(res) {
                _saveAllCollections(res.data);
            })
            .fail(function(error) {
                $.print("getCollections fail!!");
            });
    };

    var addCollection = function(collection_name) {
        BaasBox.createCollection(collection_name)
            .done(function(res) {
                getCollections();
            })
            .fail(function(error) {
                $.print("createCollections fail!!");
            });
    };

    var deleteCollection = function(collection_name) {
        BaasBox.deleteCollection(collection_name)
            .done(function(res) {
                getCollections();
            })
            .fail(function(error) {
                $.print("deleteCollection fail!!");
            });
    };

    var countDocuments = function(collection_name) {
        BaasBox.fetchObjectsCount(collection_name)
            .done(function(res) {
                $.print(res.data.count);
                BaasContact.Views.Collections.showDocumentsNumber(res.data.count);
            })
            .fail(function(error) {
                $.print("deleteCollection fail!!");
            });      
    };
    
    var loadAllDocuments =function(collection_name) {
        BaasBox.loadCollection(collection_name)
            .done(function(documents) {
                BaasContact.Views.Collections.showDocuments(documents);
                $.print(documents);
            })
            .fail(function(err) {
                $.print("loadAllDocuments fail!!");
		    });
    };
    
    var grantAccessToObject = function(collection, documentId, permission, permissionOn, target) {
        var res;
        switch (permissionOn) {
        case "role":
            res = BaasBox.grantRoleAccessToObject(collection, documentId, permission, target);
            break;
        case "user":
            res = BaasBox.grantUserAccessToObject(collection, documentId, permission, target);
            break;
        }
        
        res.done(function() {
                $.notify("Granted!");
            })
            .fail(function (err) {
                var errInfo = JSON.parse(err.responseText);
                var errMsg = errInfo.message;
                $.print(errMsg);
                $.notify(errMsg);
            });
    };
    
    var revokeAccessToObject = function(collection, documentId, permission, permissionOn, target) {
        var res;
        switch (permissionOn) {
        case "role":
            res = BaasBox.revokeRoleAccessToObject(collection, documentId, permission, target);
            break;
        case "user":
            res = BaasBox.revokeUserAccessToObject(collection, documentId, permission, target);
            break;
        }
        
        res.done(function() {
                $.notify("Revoked!");
            })
            .fail(function (err) {
                var errInfo = JSON.parse(err.responseText);
                var errMsg = errInfo.message;
                $.print(errMsg);
                $.notify(errMsg);
            });
    };
  
    var updateField = function(collection, documentId, fieldname, data) {
        BaasBox.updateField(documentId, collection, fieldname, data)
            .done(function(documents) {
                loadAllDocuments(collection);
            })
            .fail(function(err) {
                $.print("updateField fail!!");
		    });
    };
    
    return {
        getCollections   :  getCollections,
        addCollection    :  addCollection,
        deleteCollection :  deleteCollection,
        countDocuments   :  countDocuments,
        loadAllDocuments :  loadAllDocuments,
        grantAccessToObject:    grantAccessToObject,
        revokeAccessToObject:   revokeAccessToObject,
        updateField         :   updateField
    };
}());

BaasContact.Views.Collections = (function () {
    
    var jsEditor;
    var renderCollections = function(data) {
        var $collection = $("#collection-list");
        var $content;
        for (var i = 0; i < data.length ; i++) {
            $content = $('<li>' + data[i] + '</li>');
            $content.data("collection", data[i]);
            $collection.append($content);
        }
    };

    var refreshCollections = function () {
        var $collection = $("#collection-list");
        $collection.empty();
    };
    
    var showCurrentCollection = function(name) {
        var $name = $("#collection-name");
        $name.text(name);
    };
    
    var showDocumentsNumber = function(number) {
        var $number = $("#document_count");
        $number.text(number);
    };
    
    var initial = function() {
        jsEditor = CodeMirror.fromTextArea($("#documents-content")[0]);
    };
    
    var showDocuments = function(documents) {  
        jsEditor.setValue(JSON.stringify(documents));
        $.beautify(jsEditor);
    };
    
    return {
        renderCollections     :  renderCollections,
        refreshCollections    :  refreshCollections,
        showCurrentCollection :  showCurrentCollection,
        showDocumentsNumber   :  showDocumentsNumber,
        showDocuments         :  showDocuments,
        initial               :  initial
    };
}());

BaasContact.Models.Administrator = (function() {
    var listGroups = function() {
        BaasBoxEx.listGroups()
            .done(function(res) {
                $.print(res);
                BaasContact.Views.Administrator.showGroups(res.data);
            })
            .fail(function(err) {
                BaasContact.Views.Administrator.clearGroups();
                $.notify("listGroups fail  permission!!");
		    });
    };
    
    var readSpecificGroup = function(group) {
        BaasBoxEx.readSpecificGroup(group)
            .done(function(res) {
                BaasContact.Views.Administrator.showSpecificGroup(res.data.enabled);
            })
            .fail(function(err) {
                $.notify("readSpecificGroup fail  permission!!");
            });
    };
    
    var enableAnEndpointGroup = function(group) {
        BaasBoxEx.enableAnEndpointGroup(group)
            .done(function(res) {
                listGroups();
            })
            .fail(function(err) {
                 $.notify("enableAnEndpointGroup fail  permission!!");
            });
    };
    
    var disableAnEndpointGroup = function(group) {
        BaasBoxEx.disableAnEndpointGroup(group)
            .done(function(res) {
                listGroups();
            })
            .fail(function(err) {
                 $.notify("disableAnEndpointGroup fail  permission!!");
            });
    };
    
    return {
        listGroups          : listGroups,
        readSpecificGroup   : readSpecificGroup,
        enableAnEndpointGroup  :  enableAnEndpointGroup,
        disableAnEndpointGroup :  disableAnEndpointGroup
        
    };
}());

BaasContact.Views.Administrator = (function() {
    var jsEditor;
    
    var initial = function() {
        jsEditor = CodeMirror.fromTextArea($("#group-content")[0]);
    };
    
    var showGroups = function(groups) {
        jsEditor.setValue(JSON.stringify(groups));
        $.beautify(jsEditor);
    };
    
    var clearGroups = function() {
        jsEditor.setValue("");
         $.beautify(jsEditor);
    };
    
    var showSpecificGroup = function(value) {
        $("#specific-value").val(value);
    };
    
    return {
        initial     :   initial,
        showGroups  :   showGroups,
        clearGroups :   clearGroups,
        showSpecificGroup : showSpecificGroup
    };
}());
