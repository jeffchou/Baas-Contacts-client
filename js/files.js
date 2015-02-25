$(document).ready(function() {
	// register | controller
	var filesOutput = CodeMirror.fromTextArea($("#files-output")[0]);
	//filesOutput.setSize(950, 300);

	$('#files-form').on('show.bs.modal', function () {
        		setTimeout(function () {
        			getMyFiles();
        		}, 500);
        	})
	.find(".modal-dialog").css("width", 800).css("height", 700);

    $("#my-files").click(function() {
        $('#files-form').modal({backdrop: "static"});
        	
    });

    $("#fetch-files").click(function () {
    	getMyFiles();
    });

    $("#fetch-one-file").click(function () {
        var fileId = $("#file-id").val();

        $.get(BaasBox.endPoint + '/file/details/' + fileId)
            .done(function (res) {
                $.print(res);
                filesOutput.setValue($.jsBeautify(res));
            })
            .fail(function(res){
                $.notify(res);
                filesOutput.setValue($.jsBeautify(res));
            });
    })

    var getMyFiles = function() {
    	$.get(BaasBox.endPoint + '/file/details')
    		.done(function (res) {
                $.print(res);
    			filesOutput.setValue($.jsBeautify(res));
    		})
    		.fail(function(res){
				$.notify(res);
    		});
    };

    $("#revoke-file").click(function () {
        // read "roles": [BaasBox.ANONYMOUS_ROLE]
        var fileId = $("#file-id").val(),
            permission = $("#file-ac-permission").val(),
            permissionOn = $('input[name=permissions-on]:checked', '#files-form').val().toLowerCase(),
            target = $("#file-ac-target").val();

        var res;
        switch (permissionOn) {
        case "role":
            res = BaasBox.revokeRoleAccessToFile(fileId, permission, target);
            break;
        case "user":
            res = BaasBox.revokeUserAccessToFile(fileId, permission, target);
            break;
        }

        res.done(function() {
                $.notify("Revoked!");
            })
            .fail(function (err) {
                $.print(err);
                $.notify(err);
                filesOutput.setValue($.jsBeautify(err));
            });
    });

    $("#grant-file").click(function () {
        // read "roles": [BaasBox.ANONYMOUS_ROLE]
        var fileId = $("#file-id").val(),
            permission = $("#file-ac-permission").val(),
            permissionOn = $('input[name=permissions-on]:checked', '#files-form').val().toLowerCase(),
            target = $("#file-ac-target").val();

        var res;
        switch (permissionOn) {
        case "role":
            res = BaasBox.grantRoleAccessToFile(fileId, permission, target);
            break;
        case "user":
            res = BaasBox.grantUserAccessToFile(fileId, permission, target);
            break;
        }   

        res.done(function() {
                $.notify("Granted!");
            })
            .fail(function (err) {
                $.print(err);
                $.notify(err);
                filesOutput.setValue($.jsBeautify(err));
            });
    });

    $("#delete-file").click(function () {
        var fileId = $("#file-id").val();

        BaasBox.deleteFile(fileId)
            .done(function(res){
                $.notify("deleted");
                $.print(res);
            })
            .fail(function (res) {
                $.notify("error on delete");
                $.print(res);
            })
    });
});