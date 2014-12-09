var DEBUG = false;

$.print = function(msg, type) {
	if (typeof type !== "undefined")
		console.log(type, msg);
	else
		console.log(msg);
}

$(document).ready(function(){
	// start program here while the whole page is ready.
	$.print("hello contact user");
	
	
});