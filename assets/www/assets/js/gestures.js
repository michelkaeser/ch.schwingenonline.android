/**
 * Initializes the gesture events.
 */
function init_gestures() {
	var doc = $$('html, body');

	doc.swipeLeft(function() {
		if (!$('#sidr').hasClass('deactivated')) {
			$.sidr('close');
		}
	});

	doc.swipeRight(function() {
		if (!$('#sidr').hasClass('deactivated')) {
			$.sidr('open');
		}
	});
}