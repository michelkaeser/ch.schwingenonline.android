/**
 * Function/event that is fired as soon as the DOM is loaded.
 *
 * @method onLoad
 */
function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

/**
 * Function/event that is fired as soon as Cordova (PhoneGap) is ready.
 *
 * The Cordova framework can add various listeners to the application.
 * We have to wait until it's loaded before we can add them though.
 *
 * @event onDeviceReady
 */
function onDeviceReady() {
    document.addEventListener('backbutton', onBackKeyDown, false);
    document.addEventListener('menubutton', onMenuKeyDown, false);
    document.addEventListener('searchbutton', onSearchKeyDown, false);

    document.addEventListener('volumeupbutton', onVolumeUpKeyDown, false);
    document.addEventListener('volumedownbutton', onVolumeDownKeyDown, false);

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
}

/**
 * Event that gets raised after back button press.
 *
 * @event onBackKeyDown
 */
function onBackKeyDown() {
	navigator.app.backHistory;
}

/**
 * Event that gets raised after menu button press.
 *
 * @event onMenuKeyDown
 */
function onMenuKeyDown() {}

/**
 * Event that gets raised after search button press.
 *
 * @event onSearchKeyDown
 */
function onSearchKeyDown() {}

/**
 * Event that gets raised after volume up button press.
 *
 * @event onVolumeUpKeyDown
 */
function onVolumeUpKeyDown() {}

/**
 * Event that gets raised after volume down button press.
 *
 * @event onVolumeDownKeyDown
 */
function onVolumeDownKeyDown() {}

/**
 * Event that gets raised when the device goes online.
 *
 * @event onOnline
 */
function onOnline() {}

/**
 * Event that gets raised when the device goes offline.
 *
 * @event onOnline
 */
function onOffline() {}
