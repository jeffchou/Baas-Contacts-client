var BaasBoxEx = {};

(function (BaasBoxEx, global) {
	BaasBoxEx.suspendUser = function(name) {
		return $.ajax({
            method: "PUT",
            url: BaasBox.endPoint + "/admin/user/suspend/" + name
        });
	};

	BaasBoxEx.activateUser = function(name) {
		return $.ajax({
            method: "PUT",
            url: BaasBox.endPoint + "/admin/user/activate/" + name
        });
    };
    
    BaasBoxEx.changeUserName = function(name) {
        return $.ajax({
            url: BaasBox.endPoint + '/me/username',
            method: 'PUT',
            data: JSON.stringify({"username" : name}),
            contentType: 'application/json'
        });
    };

	BaasBoxEx.getCollections = function() {
		return $.ajax({
			method: "GET",
			url: BaasBox.endPoint + "/admin/dbStatistics"
		});
	};

    BaasBoxEx.fetchCurrentSettings = function() {
        return $.ajax({
            method: "GET",
            url:BaasBox.endPoint + "/admin/configuration/dump.json"
        });
    };
    
    BaasBoxEx.fectchSectionOfSettings = function(section) {
        return $.ajax({
            method: "GET",
             url: BaasBox.endPoint + "/admin/configuration/" + section
        });
    };
    
    BaasBoxEx.updateValueInSettings = function(section, key, value) {
        return $.ajax({
            method: "PUT",
            url: BaasBox.endPoint + "/admin/configuration/" + section + "/" +key + "/" + value
        });
    };
    
    BaasBoxEx.listGroups = function() {
        return $.ajax({
            method: "GET",
            url: BaasBox.endPoint + "/admin/endpoints"
        });
    };
    
    BaasBoxEx.readSpecificGroup = function(GroupName) {
        return $.ajax({
            method: "GET",
            url: BaasBox.endPoint + "/admin/endpoints/" + GroupName
        });
    };
    
    BaasBoxEx.enableAnEndpointGroup = function(GroupName) {
        return $.ajax({
            method: "PUT",
            url: BaasBox.endPoint + "/admin/endpoints/" + GroupName + "/enabled"
        });
    };
    
    BaasBoxEx.disableAnEndpointGroup = function(GroupName) {
        return $.ajax({
            method: "DELETE",
            url: BaasBox.endPoint + "/admin/endpoints/" + GroupName + "/enabled"
        });
    };
	// add more BaasBox extensions
} (BaasBoxEx, window));