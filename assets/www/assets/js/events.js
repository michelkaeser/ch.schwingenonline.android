/**
 * onGoing click event listener for internal links.
 * We need this to process clicks. on for ajax loaded content.
 */
$(document).on('click', 'a[data-routing]', function(e) {
    e.preventDefault();

    var $this = $(this);
    var notification = navigator.notification;

    notification.activityStart("Laden", "Inhalt wird geladen...");

    async.waterfall([
        function(callback) {
            process_click($this, callback);
        },
        function(callback) {
        	wait_for_images(callback);
        },
        function(callback) {
        	update_scroller(callback);
        }
    ], function (err, result) {
    	setTimeout(function() {
    		notification.activityStop();
    	}, 375);
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