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
    }

	// add more BaasBox extensions
} (BaasBoxEx, window));