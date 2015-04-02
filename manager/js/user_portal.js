"use strict";

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    $('#connect').bind('click', function () {
	var button = $('#connect').get(0);
	if (button.value == 'connect') {
	    button.value = 'disconnect';

	    connection.connect($('#jid').get(0).value,
			       $('#pass').get(0).value,
			       onConnect);
	} else {
	    button.value = 'connect';
	    connection.disconnect();
	}
    });
    
	registerButtonEvent();
	
	console.info("ready....");
    
});

function registerButtonEvent() {

	$("#send_message").click(function() {
		console.info("send_message button pressed...");

		var messageBody=$("#message_body").val();
		console.info("messageBody="+messageBody);
		
		var data=JSON.parse(messageBody);
		var message=JSON.stringify(data);
		
		var from=$("#jid").val();
		var to=data.jid;
		
		console.info("from="+from);
		console.info("to="+to);
		console.info("message="+message);
		
		var reply = $msg({to: to, from: from, type: 'chat'})
				.cnode(Strophe.xmlElement('body', message));
		//		.t(message);
				
		 sendMessage(reply);
		
		/*
		console.info("connection="+connection);
		connection.send(reply.tree());
		*/
		

	});
	
}

function sendMessage(reply) {
	console.info("connection="+connection);
	console.info("reply="+reply);
	console.info("reply.tree()="+reply.tree());
	connection.send(reply.tree());
}


//var BOSH_SERVICE = 'http://172.16.114.42:5280/http-bind';
var BOSH_SERVICE = 'http://172.16.114.42/http-bind/';
var connection = null;

function log(msg) 
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

function onConnect(status) {
	if (status == Strophe.Status.CONNECTING) {
		log('Strophe is connecting...');
    } else if (status == Strophe.Status.CONNFAIL) {
		log('Strophe failed to connect.');
		$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
		log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
		log('Strophe is disconnected.');
		$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
		log('Strophe is connected.');
		log('ECHOBOT: Send a message to ' + connection.jid + 
	 	   ' to talk to me.');

		connection.addHandler(onMessage, null, 'message', null, null,  null);
		connection.send($pres().tree());
		
	}
}

function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
	var body = elems[0];
	
	var message=Strophe.getText(body);

	log('ECHOBOT: I got a message from ' + from + ': ' + 
	    message);
    }
    
    $("#gird_data").html(message);

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;
}


