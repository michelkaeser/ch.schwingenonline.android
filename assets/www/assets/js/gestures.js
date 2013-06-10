/**
 * Initializes the gesture events.
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