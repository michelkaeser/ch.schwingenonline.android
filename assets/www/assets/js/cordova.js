/**
 * Event that gets raised as soon as the DOM is loaded.
 */
function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

/**
 * Event that gets raised when Cordova (PhoneGap) is ready.
 *
 * The Cordova framework can add various listeners to the application.
 * We have to wait until it's loaded before we can add them though. */
function onDeviceReady() {
    async.parallel([
        function(callback) {
            setTimeout(function() {
                //document.addEventListener('backbutton', onBackKeyDown, false);
                document.addEventListener('menubutton', onMenuKeyDown, false);
                document.addEventListener('searchbutton', onSearchKeyDown, false);

                /*document.addEventListener('volumeupbutton', onVolumeUpKeyDown, false);
                document.addEventListener('volumedownbutton', onVolumeDownKeyDown, false);*/

                document.addEventListener('online', onOnline, false);
                document.addEventListener('offline', onOffline, false);
                return callback(null);
            }, 0);
        },
        function(callback) {
            load_routing(callback);
        },
        function(callback) {
            load_sidepanels(callback);
        },
        function(callback) {
            load_templates(callback);
        }
    ], function(err, results) {
        init_app();
        init_gestures();
    });
}

/**
 * Event that gets raised after back button press.
 */
function onBackKeyDown() {
    // TODO: back history (a la stack)
	navigator.app.backHistory;
}

/**
 * Event that gets raised after menu button press.
 */
function onMenuKeyDown() {
	navigator.notification.confirm(
	    "Möchten Sie die Anwendung wirklich beenden?",
	    function(btn) {
            if (btn === 1) {
                if (navigator.app){
                    navigator.app.exitApp();
                } else if (navigator.device) {
                    navigator.device.exitApp();
                }
            }
        },
	    'Beenden',
	    'Ja,Nein'
	);
}

/**
 * Event that gets raised after search button press.
 */
function onSearchKeyDown() {
    $('#search').click();
}

/**
 * Event that gets raised after volume up button press.
 */
function onVolumeUpKeyDown() {}

/**
 * Event that gets raised after volume down button press.
 */
function onVolumeDownKeyDown() {}

/**
 * Event that gets raised when the device goes online.
 */
function onOnline() {}

/**
 * Event that gets raised when the device goes offline.
 */
function onOffline() {}
