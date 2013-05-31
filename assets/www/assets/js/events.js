/**
 * Event that gets raised as soon as the DOM is loaded.
 */
function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);

    init_db(function() {
        load_templates(function() {
            init_app();
        });
    });
}

/**
 * Event that gets raised when Cordova (PhoneGap) is ready.
 *
 * The Cordova framework can add various listeners to the application.
 * We have to wait until it's loaded before we can add them though. */
function onDeviceReady() {
    //document.addEventListener('backbutton', onBackKeyDown, false);
    document.addEventListener('menubutton', onMenuKeyDown, false);
    document.addEventListener('searchbutton', onSearchKeyDown, false);

    /*document.addEventListener('volumeupbutton', onVolumeUpKeyDown, false);
    document.addEventListener('volumedownbutton', onVolumeDownKeyDown, false);

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);*/
}

/**
 * Event that gets raised after back button press.
 */
function onBackKeyDown() {
	navigator.app.backHistory;
}

/**
 * Event that gets raised after menu button press.
 */
function onMenuKeyDown() {
	navigator.notification.alert(
	    "Schwingenonline.ch Android App\nVersion: 2.1.0\nQuellcode: https://github.com/MaddinXx/ch.schwingenonline.android",
	    function() {},
	    'Info',
	    'OK'
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
