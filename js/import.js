
var jsEditor;
function initializeImport() {
	$("#p-c-add").show();
	$("#p-add-contact-form").on("show.bs.modal", function (e) {
		
		setTimeout(function (argument) {
			if (!jsEditor) {
				jsEditor = CodeMirror.fromTextArea($("#raw-contacts")[0], {
					lineNumbers: true
				});
			}
		}, 300);
		
	});


	$("#import-contacts").click(function(e) {
		e.preventDefault();

		var rawData;
		try {
			rawData = JSON.parse(jsEditor.getValue());
		} catch(ex) {
			alert("Error on input json data: " + ex);
		}

		// prepare new contacts.
		var newContacts = [];
		if (typeof rawData.data != "undefined") {
			// json data from old baasbox
			var i, rawContact;
			for (i = 0; i < rawData.data.length; i++) {
				rawContact = rawData.data[i];
				var key, newContact = {};
				for (key in rawContact){
					if (key != "id" && key[0] != '@') {
						newContact[key] = rawContact[key];
					}
				}
				newContacts.push(newContact);
			}
		} else {
			// array data from .csv
			var i, rawContact;
			for (i = 0; i < rawData.length; i++) {
				rawContact = rawData[i];
				var newContact = {
					employeeId: rawContact[0],
					name: rawContact[1],
					department : "rc",
					extNo: rawContact[2].toString(),
					email: rawContact[3],
					mobileNo: "0" + rawContact[4],
					birthDay: rawContact[5],
					address: rawContact[6]
				}
				newContacts.push(newContact);
			}
		}

		$.print(newContacts);

		// loop add. (ugly, better do it with generator and yield)
		var fails = [];
		var i = 0;
		var loopAdd = function() {
			BaasBox.save(newContacts[i], CONTACK_COLLECTION)
				.done(function(res) {
					$.print("ok " + i);
					$.notify(i + " contacts added");
					addNext();
				})
				.fail(function(err) {
					$.print("failed. " + i);
					fails.push(newContacts[i])
					addNext();
				});
		};
		var addNext = function () {
			i++;
			if (i < newContacts.length) {
				setTimeout( loopAdd, 30 );
			} else {
				// end of loop
				if (fails.length > 0) {
					$.print(fails);
					$.notify(newContacts.length + " contacts to add, but " + fails.length + " of them failed, plz look at the debugger");
				} else {
					$.notify(newContacts.length + " contacts added");
				}
				$("#p-add-contact-form").modal('hide');
				loadContacts();
			}
		};
		loopAdd();
	});
}