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

	// add more BaasBox extensions
} (BaasBoxEx, window));