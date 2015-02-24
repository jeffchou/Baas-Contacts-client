$.ready(function(){
	// register | controller
	return ;
	var filesOutput = CodeMirror.fromTextArea($("#files-output")[0]);
	//filesOutput.setSize(950, 300);

	$('#files-form').on('show.bs.modal', function () {
        		setTimeout(function () {
        			getAllAssets();
        		}, 500);
        	})
	.find(".modal-dialog").css("width", 1000);

    $("#my-files").click(function() {
        $('#files-form').modal({backdrop: "static"});
        	
    });

    $("#refresh-files").click(function () {
    	getMyFiles();
    });


    var getMyFiles = function() {
    	$.get(BaasBox.endPoint + '/file/details')
    		.done(function (res) {
    			filesOutput.setValue($.jsBeautify(res));
    		})
    		.fail(function(res){
				$.notify(res);
    		})
    };
});