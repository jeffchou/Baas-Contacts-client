(function ($, global) {

	$.makeStateMachine = function (object) {
		// Make a object to be a satemachine, which can call 'gotoState()'
		// 1 - 'object' must have public member 'States' as a container of states.
		// 2 - each state object inside the 'State' must have enter() and leave() as public function

		$.extend(object, {
			previousState: null,
			currentState: null,
			currentStateDesc: "",
			previousStateDesc: "",

			gotoState: function (newState, param) {
				if (DEBUG) {
					$.print("# GOTO state : " + newState);
				}
				this.previousState = this.currentState;
				this.currentState = this.States[newState];

				if (this.previousState != null) {
					this.previousStateDesc = this.currentStateDesc;
					this.previousState.leave(param);
				}
				else {
					this.previousStateDesc = newState;
				}

				if (this.currentState != null) {
					this.currentStateDesc = newState;
					this.currentState.enter(param);
				}
			},
			getCurrState: function () {
				return this.currentStateDesc;
			},
			getPreState: function () {
				return this.previousStateDesc;
			}
		});
	};

	$.print = function(msg, type) {
	if (typeof type !== "undefined")
		console.log(type, msg);
	else
		console.log(msg);
	};

	$.notify = function(msg) {
		BaasContact.Views.Notify.show(msg);
	};

	// add more jQuery plugins
} (jQuery, window));