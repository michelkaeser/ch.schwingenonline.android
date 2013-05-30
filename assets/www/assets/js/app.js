/* Stores the landing page uri.
 * @var string */
var _home = 'news_recent';

/* Stores the loaded templates.
 * @var array */
var _tpl = {};


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
    	'search',
    	'search_results'
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
	    		store.set(tpl, data, 60);
	    	})
	    	.fail(function(xhr, status, error) {});
	    }
    });

    callback();
}

/**
 * Initializes the application.
 *  */
function init_app() {
	$(document).on('click', 'a:not([href])', function(e) {
	    e.preventDefault();
	    $('#loader').show();

	    var tab = $(this).data('tab');
	    var type = $(this).data('type');
	    var page = $(this).data('page');
	    var tpl = $(this).data('tpl');

	    process_click(tab, type, page, tpl, function() {
	    	$('#loader').hide();
	    	$('html, body').scrollTop(96);
	    });
	});


	process_click('news', 'news', 'recent', 'news', function() {
		$('#loader').hide();
		$('html, body').scrollTop(96);
	});
}


/**
 * Processes click events.
 * Every time a link gets clicked a 'click' event is raised. */
function process_click(tab, type, page, tpl, callback) {
	update_ui(tab, type, page);

	if (type == 'search' && page == 'form') {
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
}

/**
 *
 * */
function get_data(type, page, callback) {
	var uri = type + '_' + page;

	if (store.has(uri)) {
		callback(store.get(uri));
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
			case 'search':
				source = "http://www.schwingenonline.ch/api/json/get_search_results/?search=" + store.get('search_value') + "&callback=?";
				break;
			default:
		}

		fetch_json(uri, source, function(respond) {
			store.set(uri, respond, 10);
			callback(respond);
		});
	}
}

/**
 *
 */
function render_tpl(tpl, data, callback) {
	var output = Mustache.render(_tpl[tpl], data);
	$('#main').html(output);

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