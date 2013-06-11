/**
 * The 'gestures.js' file is meant for everything related to touch gestures/control.
 * -----
 * init_gestures() is called during app initialization in cordova.js\onDeviceReady().
 * QuoJS is the included micro JS library that handles touch gestures:
 * http://quojs.tapquo.com/
 *
 * @author Michel Käser <mk@frontender.ch>
 */

/**
 * Initializes the gesture listening/events.
 *
 * @see cordova.js\onDeviceReady()
 * @since 2.6.1
 */
function init_gestures() {
	var doc = $$('body');
	var sidr = $('#sidr');

	doc.swipeLeft(function() {
		if (!sidr.hasClass('deactivated')) {
			$.sidr('close');
		}
	});

	doc.swipeRight(function() {
		if (!sidr.hasClass('deactivated')) {
			$.sidr('open');
		}
	});
}
