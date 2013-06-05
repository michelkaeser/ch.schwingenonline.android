/**
 * onGoing click event listener for internal links.
 * We need this to process clicks. on for ajax loaded content.
 */
$(document).on('click', 'a[data-routing]', function(e) {
    e.preventDefault();
    navigator.notification.activityStart("Laden", "Inhalt wird geladen...");

    process_click($(this), function() {
    	hide_loader();
    });
});

/**
 * Click event listener for action-overflow-icon.
 * We need this to prevent default behavior.
 */
$('.action-overflow-icon').click(function(e) {
	e.preventDefault();
});

/**
 * onGoing click event listener for actiobar-spinner links.
 * We need this to close the menu after clicking an item.
 */
$(document).on('click', '.spinner-item', function(e) {
	e.preventDefault();
	$(this).parent('.action-overflow-list').toggle().removeClass('active');
});