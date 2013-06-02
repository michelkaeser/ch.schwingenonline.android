/* Stores the app's base URL.
 * @var string
 */
var _base = 'http://www.schwingenonline.ch';

/* Stores the landing page uri.
 * @var string
 */
var _home = 'news_recent';

/* Stores the loaded templates.
 * @var array
 */
var _tpl = {};

/* Stores some application data.
* @var array
*/
var _data = {};


/**
 * Loads the templates.
 * Loads every template file defined in templates into _tpl array for direct access.
 * @param callback - callback function
 */
function load_templates(callback) {
    var templates = [
    	'categories',
    	'error',
    	'news',
    	'post',
    	'search',
    	'search_results'
    ];

    $.each(templates, function(i, e) {
    	$.ajax({
	    	url: 'tpl/' + e + '.mustache',
	    	dataType: 'html',
	    	cache: true
	    })
	    .done(function(data, status, xhr) {
	    	_tpl[e] = data;
    	})
    	.fail(function(xhr, status, error) {});
    });

    return( callback() );
}

/**
 * Initializes the application.
 */
function init_app() {
	$(document).on('click', 'a:not([href])', function(e) {
	    e.preventDefault();
	    navigator.notification.activityStart("Inhalt wird geladen", "Laden...");

	    var tab = $(this).data('tab');
	    var type = $(this).data('type');
	    var page = $(this).data('page');
	    var tpl = $(this).data('tpl');

	    process_click(tab, type, page, tpl, hide_loader);
	});

	setTimeout(function () {
		window.localStorage.clear();

		$('#news').find('.tab').click();

		iscroll = new iScroll('iscroll', {
			hScroll: false,
			hScrollbar: false,
			bounce: false,
			momentum: false
		});
	}, 750);
}

/**
 * Processes click events.
 * Every time a link gets clicked a 'click' event is raised.
 *
 * @param tab - tab to activate
 * @param type - type of the target page
 * @param page - target page (id)
 * @param tpl - template to render
 * @param callback - callback function
 */
function process_click(tab, type, page, tpl, callback) {
	update_ui(tab, type, page);

	if (type == 'search' && page == 'form') {
		render_tpl(tpl, '', function() {
			return( callback() );
		});
	} else {
		get_data(type, page, function(respond) {
			render_tpl(tpl, respond, function() {
				return( callback() );
			});
		});
	}
}

/**
 * Updates the UI.
 * Adds and removes classes and states of UI elements.
 *
 * @param tab - tab to activate
 * @param type - type of the target page
 * @param page - target page (id)
 */
function update_ui(tab, type, page) {
	var uri = type + '_' + page;

	if (uri == _home) {
		$('.app-icon').removeClass('up').attr('disabled', 'disabled');
		$('.chevron').hide();
	} else {
		$('.app-icon').addClass('up').removeAttr('disabled');
		$('.chevron').show();
	}

	$('.tab').parent().removeClass('active');
	$('#' + tab).addClass('active');
}

/**
 * Returns the data for given URI.
 * Fetchs and returns the data for the given URI and proceeds with callback.
 *
 * @param type - type of the target page
 * @param page - target page (id)
 * @param callback - callback function
 */
function get_data(type, page, callback) {
	var uri = type + '_' + page;
	var storage = window.localStorage.getItem(uri);

	if (storage != null) {
		var json = $.parseJSON(storage)
		return( callback(json) );
	} else {
		var source;

		switch (type) {
			case 'news':
				source = _base + "/api/json/get_recent_posts/?include=id,title_plain,excerpt&callback=?";
				break;
			case 'categories':
				source = _base + "/api/json/get_category_index/?callback=?";
				break;
			case 'category':
				source = _base + "/api/json/get_category_posts/?id=" + page + "&include=id,title_plain,excerpt&callback=?";
				break;
			case 'post':
				source = _base + "/api/json/get_post/?id=" + page + "&include=title_plain,content,date,thumbnail&thumbnail_size=athleten-thumb&callback=?";
				break;
			case 'search':
				source = _base + "/api/json/get_search_results/?search=" + _data['search_query'] + "&include=id,title_plain,excerpt&callback=?";
				break;
			default:
				break;
		}

		fetch_json(source, function(respond) {
			var json = JSON.stringify(respond);
			window.localStorage.setItem(uri, json);

			return( callback(respond) );
		});
	}
}

/**
 * Renders the template.
 * Renders the data with given mustache template.
 *
 * @param tpl - template to render
 * @param data - data to render
 * @param callback - callback function
 */
function render_tpl(tpl, data, callback) {
	var output = Mustache.to_html(_tpl[tpl], data, {
		'error': _tpl['error']
	});

	$('#iscroll').html(output);

	return( callback() );
}

/**
 * Fetchs a JSON from given remove URL.
 * Receivces and fetchs JSON from remote URL and proceeds with callback.
 *
 * @param url - remote origin URL
 * @param callback - callback function
 */
function fetch_json(url, callback) {
	var api = url;

	$.ajax({
		url: api,
		type: 'GET',
		dataType: 'json',
		timeout: 5000,
		cache: true,
		success: function(data) {
			callback(data);
		},
		error: function() {}
	});

	return false;
}

/**
 * Hides the loading animation.
 * Hides the loader and scrolls back to top to reset previous scolling position.
 */
function hide_loader() {
	setTimeout(function() {
		navigator.notification.activityStop();
	}, 750);

	setTimeout(function() {
		iscroll.refresh();
		iscroll.scrollTo(0, 0, 0, false);
	}, 0);

	$('#iscroll').waitForImages(function() {
	    iscroll.refresh();
	    iscroll.scrollTo(0, 0, 0, false);
	});
}