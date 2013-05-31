Quo(document).ready(function($$) {

	$$('body').swipeLeft(function() {
		switch_tab();
	});

	$$('body').swipeRight(function() {
		switch_tab();
	});

});

/**
 * Switches the current active tab.
 * Fired through the event 'swipeLeft'.
 */
function switch_tab() {
	var active = $('.tab').parent('.active').attr('id');

	if (active == 'news') {
		$('#categories').click();
	} else {
		$('#news').click();
	}
}