/**
 * Function/event that is fired as soon as the DOM is loaded.
 *
 * The onLoad function can be used to execute code as soon as the DOM is loaded.
 * It needs to be triggered in the <body> by adding: onload="onLoad()"
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
    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
}

/**
 * Event that gets raised after back button press.
 *
 * This event is raised by Cordova every time the back button press is detected.
 *
 * @event onBackKeyDown
 */
function onBackKeyDown() {
	navigator.app.backHistory;
}

/**
 * Event that gets raised after menu button press.
 *
 * This event is raised by Cordova every time the menu button press is detected.
 *
 * @event onMenuKeyDown
 */
function onMenuKeyDown() {}

/**
 * Event that gets raised when the device goes online.
 *
 * This event is raised by Cordova every time the device changes it's network state to online.
 *
 * @event onOnline
 */
function onOnline() {}

/**
 * Event that gets raised when the device goes offline.
 *
 * This event is raised by Cordova every time the device changes it's network state to offline.
 *
 * @event onOnline
 */
function onOffline() {}
