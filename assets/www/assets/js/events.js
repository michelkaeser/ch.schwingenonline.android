/**
 * The 'events.js' file is meant for everything related to regular events/triggers.
 * -----
 * If you have events that get raised when using the application, you should place
 * them in here to have them centralized.
 *
 * @author Michel Käser <mk@frontender.ch>
 */

/**
 * App internal link click listener/event.
 * The event is fired every time a link with data-routing set is clicked.
 * Every app internal link should have data-routing set (see routing.json)
 *
 * @since 2.6.1
 */
$(document).on('click', 'a[data-routing]', function(e) {
    e.preventDefault();

    var $this = $(this);
    var notification = navigator.notification;

    _iscroll.destroy();
    notification.activityStart("Laden", "Inhalt wird geladen...");

    async.waterfall([
        function(callback) {
            process_click($this, callback);
        },
        function(callback) {
        	wait_for_images(callback);
        }
    ], function (err, result) {
        _iscroll.refresh();

    	setTimeout(function() {
    		notification.activityStop();
    	}, 450);
    });
});

/**
 * Dropdown menu link click listener/event.
 * Needed to close the dropdown menu after clicking one of it's child links.
 *
 * @since 2.6.1
 */
$(document).on('click', '.spinner-item', function(e) {
	e.preventDefault();
	$(this).parent('.action-overflow-list').toggle().removeClass('active');
});

/**
 * Dropdown icon click listener/event.
 * Needed to prevent opening as regular link when clicking the dropdown icon in actionbar.
 *
 * @since 2.6.1
 */
$('.action-overflow-icon').click(function(e) {
    e.preventDefault();
});

/******************************************************************************
* LAYOUT EVENTS END
******************************************************************************/

/**
 * iScroll scroll refresh event.
 * This event gets fired every time the iscroll object gets refreshed (e.g. when scrolling).
 * We need this for pull-to-refresh.
 *
 * @since 2.6.1
 *
 * @param puller {Object} object storing puller related properties
 */
function onScrollerRefresh(puller) {
    var dom = puller.dom;

    if (dom.hasClass('loading')) {
        dom.removeClass();
        dom.find('.pullUpLabel').html("Ziehen zum Aktualisieren...");
    }
}

/**
 * iScroll pullXY move event.
 * This event gets fired every time the iscroll pull-to-refresh object gets moved
 * (e.g. when pulling for more content).
 * We need this for pull-to-refresh.
 *
 * @since 2.6.1
 *
 * @param puller {Object} object storing puller related properties
 */
function onScrollerMove(puller) {
    var dom = puller.dom;

    if (_iscroll.y < (_iscroll.maxScrollY - 5) && !dom.hasClass('flip')) {
        dom.addClass('flip');
        dom.find('.pullUpLabel').html("Loslassen zum Aktualisieren...");
        _iscroll.maxScrollY = _iscroll.maxScrollY;
    } else if (_iscroll.y > (_iscroll.maxScrollY + 5) && dom.hasClass('flip')) {
        dom.removeClass();
        dom.find('.pullUpLabel').html("Ziehen zum Aktualisieren...");
        _iscroll.maxScrollY = puller.offset;
    }
}

/**
 * iScroll scoll end event.
 * This event gets fired every time the iscroll reached the bottom.
 * We need this for pull-to-refresh.
 *
 * @since 2.6.1
 *
 * @param puller {Object} object storing puller related properties
 * @triggers onPullUpRelease()
 */
function onScrollerEnd(puller) {
    var dom = puller.dom;

    if (dom.hasClass('flip')) {
        dom.removeClass('flip').addClass('loading');
        dom.find('.pullUpLabel').html("Laden...");

        onPullUpRelease();
    }
}

/**
 * iScroll pull-up release event.
 * This event gets fired every time the iscroll pull-to-refresh object is released.
 * (e.g. when pulling for more content has been fully pulled).
 * We need this to load content with pull-to-refresh.
 *
 * @since 2.6.1
 */
function onPullUpRelease() {
    var rqst = _puller;
    rqst.identifier = rqst.identifier_raw;

    if (rqst.method == "inc") {
        rqst.identifier += rqst.next++;
    } else {
        rqst.identifier += rqst.next--;
    }

    async.waterfall([
        function(callback) {
            get_data(rqst, callback);
        },
        function(arg1, callback) {
            arg1.pulled = true;

            render_tpl(rqst.tpl, arg1, '#mustache', true, callback);
        }
    ], function (err, result) {
        _iscroll.refresh();
    });
}

/******************************************************************************
* ISCOLLER EVENTS END
******************************************************************************/
