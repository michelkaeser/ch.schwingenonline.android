/**
 * Initializes the gesture events.
 */
function init_gestures() {
	var doc = $$('html, body');

	doc.swipeLeft(function() {
		$.sidr('close');
	});

	doc.swipeRight(function() {
		$.sidr('open');
	});
}