/**
 * The 'cordova.js' file is meant for everything related to PhoneGap/Cordova events/triggers.
 * -----
 * onLoad() is fired after the DOM has loaded and should therefor be used to initialize the
 * whole application.
 * We wait for Cordova to be ready first so we can use all featurs like notifications.
 *
 * @author Michel Käser <mk@frontender.ch>
 */

/**
 * DOM loaded event.
 * The onLoad() event is triggered in index.html as soon as the DOM is ready and loaded.
 * We don't have to bother afterwards if libraries are loaded -> they are.
 *
 * @since 2.6.1
 *
 * @triggers onDeviceReady()
 */
function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

/**
 * Cordova/Device ready event.
 * This event is triggered by onLoad() as soon as Cordova is ready.
 * The main initialization should therefor be placed in here as we
 * can be sure that really everything is ready.
 *
 * @since 2.6.1
 */
function onDeviceReady() {
    async.parallel([
        function(callback) {
            setTimeout(function() {
                document.addEventListener('menubutton', onMenuKeyDown, false);
                document.addEventListener('searchbutton', onSearchKeyDown, false);
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
        },
        function(callback) {
            setTimeout(function() {
                _preferences = cordova.require('cordova/plugin/applicationpreferences');
                return callback(null);
            }, 0);
        }
    ], function(err, results) {
        apply_preferences();
        init_app();
        init_gestures();
    });
}

/**
 * Menu button pressed event.
 * This event gets fired by Cordova when the menu button on device is pressed.
 * It's smart to use this to display a notification or menu with links
 * e.g. to preferences, app info etc.
 *
 * @since 2.6.1
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
 * Search button pressed event.
 * This event gets fired by Cordova when the search button on device is pressed.
 * Used to "redirect" the user to the search form.
 *
 * @since 2.6.1
 */
function onSearchKeyDown() {
    $('#search').click();
}
