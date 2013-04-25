/*
 * onBackKeyDown() - fired each time backButton is pressed
 *****************************************************************************/

function onBackKeyDown() {
	// check if we can undo an action/event
	if (backButtonAction != null) {
		eval("$('*[data-back=\"true\"]')" + backButtonAction);

		$('*[data-back=\"true\"]').data('back', 'false');
		backButtonAction = null;
	} else {
		navigator.app.backHistory;
	}
}


/*
 * onMenuKeyDown() - fired each time menuButton is pressed
 *****************************************************************************/

function onMenuKeyDown() {}


/*
 * onOnline() - fired each time the device is online/connected
 *****************************************************************************/

function onOnline() {}


/*
 * onOffline() - fired each time the device is offline/disconnected
 *****************************************************************************/

function onOffline() {}