/**
 * Initializes the gesture events.
 */
function init_gestures() {
	var doc = $$('body');

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