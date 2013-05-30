/* Stores the version number.
 * @var string */
var _version = '1.0.1';

/* Stores the landing page uri.
 * @var string */
var _home = 'news_recent';

/* Stores the loaded templates.
 * @var array */
var _tpl = {};

/* Stores the current tab.
 * @var string */
var _tab;

/* Stores the current page type.
 * @var string */
var _type;

/* Stores the current page.
 * @var string */
var _page;

/* Stores the previous tab.
 * @var string */
var _prev_tab;

/* Stores the previous page type.
 * @var string */
var _prev_type;

/* Stores the previous page.
 * @var string */
var _prev_page;


/**
 * Event that gets raised when jQuery is ready.
 * */
jQuery(document).ready(function() {
	load_templates(function() {
		init_app();
	});
});

/**
 * Loads the templates.
 * Loads every template file defined in templates into _tpl array for direct access. */
function load_templates(callback) {
    var templates = [
    	'categories',
    	'news',
    	'post',
    	'search'
    	//'search_results',
    	//'settings'
    ];

    $.each(templates, function(i, e) {
    	var tpl = '_tpl[' + e + ']';
    	if (store.has(tpl)) {
    		_tpl[e] = store.get(tpl);
    	} else {
	    	$.ajax({
	    		url: 'tpl/' + e + '.mustache',
	    		dataType: 'html',
	    		cache: true
	    	})
	    	.done(function(data, status, xhr) {
	    		_tpl[e] = data;
	    		store.set(tpl, data, 30);
	    	})
	    	.fail(function(xhr, status, error) {});
	    }
    });

    callback();
    return false;
}

/**
 * Initializes the application.
 *  */
function init_app() {
	$(document).on('click', 'a', function(e) {
	    e.preventDefault();
	    $('#loader').show();

	    var tab = $(this).data('tab');
	    var type = $(this).data('type');
	    var page = $(this).data('page');
	    var tpl = $(this).data('tpl');

	    process_click(tab, type, page, tpl, function() {
	    	$('#loader').hide();
	    });
	});

	if (store.has('version')) {
		check_version(store.get('version'), function() {
			process_click('news', 'news', 'recent', 'news', function() {
				$('#loader').hide();
			});
		});
	} else {
		process_click('news', 'news', 'recent', 'news', function() {
			$('#loader').hide();
		});
	}

	store.set('version', _version);
}


/**
 * Processes click events.
 * Every time a link gets clicked a 'click' event is raised. */
function process_click(tab, type, page, tpl, callback) {
	update_ui(tab, type, page);

	if (type == 'search') {
		render_tpl(tpl, '', function() {
			callback();
		});
	} else {
		get_data(type, page, function(respond) {
			render_tpl(tpl, respond, function() {
				callback();
			});
		});
	}

	return false;
}

/**
 * Updates the UI.
 * Adds and removes classes and states of UI elements. */
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

	_prev_tab = _tab;
	_prev_type = _type;
	_prev_page = _page;

	_tab = tab;
	_type = type;
	_page = page;
}

/**
 *
 * */
function get_data(type, page, callback) {
	var uri = type + '_' + page;

	if (store.has(uri)) {
		sanitize_data(store.get(uri), function(result) {
			callback(result);
		});
	} else {
		var source;

		switch (type) {
			case 'news':
				source = "http://www.schwingenonline.ch/api/json/get_recent_posts/?callback=?";
				break;
			case 'categories':
				source = "http://www.schwingenonline.ch/api/json/get_category_index/?callback=?";
				break;
			case 'category':
				source = "http://www.schwingenonline.ch/api/json/get_category_posts/?id=" + page + "&callback=?";
				break;
			case 'post':
				source = "http://www.schwingenonline.ch/api/json/get_post/?id=" + page + "&callback=?";
				break;
			default:
		}

		fetch_json(uri, source, function(respond) {
			sanitize_data(respond, function(result) {
				store.set(uri, result, 5);
				callback(result);
			});
		});
	}

	return false;
}

/**
 *
 */
function sanitize_data(data, callback) {
	callback(data);
	return false;
}

/**
 *
 */
function render_tpl(tpl, data, callback) {
	var output = Mustache.render(_tpl[tpl], data);
	$('#main').html(output);

	callback();
	return false;
}

function check_version(version, callback) {
	if (version != _version) {
		store.clearAll();
	}

	callback();
}

/**
 *
 */
function fetch_json(uri, url, callback) {
	var api = url;

	$.ajax({
		url: api,
		type: 'GET',
		dataType: 'json',
		timeout: 5000,
		cache: true,
		success: function(data) {
			callback(data);
		}
	});

	return false;
}