/**
 * Stores the view templates.
 * @var array
 */
var _tpl = {};

/**
 * Stores the current page type.
 * @var string
 */
var _type = 'news';

/**
 * Stores the current page.
 * @var string
 */
var _page = 'news_recent';


/**
 * jQuery Document Ready Event.
 *
 * @event ready
 * @param {event} $ raised event
 */
jQuery(document).ready(function($) {
	load_templates();
	init_app();
});

/**
 *
 */
function init_app() {
	$(document).on('click', 'a', function(e) {
	    e.preventDefault();

	    var href = $(this).attr('href');
	    var type = $(this).data('href-type');
	    var tpl = $(this).data('href-tpl');

	    process_click(href, type, tpl);
	});

	fetch_json('recent', 'news', function(respond) {
		render_tpl('news', respond);
	});
}

/**
 * Loads the view templates.
 *
 * Loads the view templates from tpl directory to local variable for app wide access.
 */
function load_templates() {
    var templates = [
    	'categories',
    	'news',
    	'post',
    	'search',
    	'search_results',
    	'settings',
    	'videos'
    ];

    $.each(templates, function(i, e) {
    	$.ajax({
    		url: 'tpl/' + e + '.mustache',
    		dataType: 'html',
    		async: false,
    		cache: false
    	})
    	.done(function(data, status, xhr) {
    		_tpl[e] = data;
    		store.set('_tpl[' + e + ']', data);
    	})
    	.fail(function(xhr, status, error) {
    		if (store.has('_tpl[' + e + ']')) {
    			_tpl[e] = store.get('_tpl[' + e + ']');
    		}
    	});
    });
}

/**
 *
 */
function process_click(href, type, tpl) {
	_type = type;
	_page = type + "_" + href;

	$('#loader').show();
	update_ui();

	fetch_json(href, type, function(respond) {
		render_tpl(tpl, respond);
	});
}

/**
 *
 */
function update_ui() {
	if (_page == 'news_recent') {
		$('.app-icon').removeClass('up').attr('data-ajax', false);
		$('.chevron').hide();
	} else {
		$('.app-icon').addClass('up').attr('data-ajax', true);;
		$('.chevron').show();
	}

	$('.tab').parent().removeClass('active');

	if (_type == 'news' || _type == 'post') {
		$('.tab[data-href-type="news"]').parent().addClass('active');
	} else {
		$('.tab[data-href-type="categories"]').parent().addClass('active');
	}
}

/**
 *
 */
function render_tpl(tpl, data) {
	var output = Mustache.render(_tpl[tpl], data);
	$('#main').html(output);
	$('#loader').fadeOut(350);
}

/**
 *
 */
function fetch_json(url, type, callback) {
	if (!store.has(type + '_' + url)) {
		var api;

		if (type == 'post') {
			api = "http://www.schwingenonline.ch/api/json/get_post/?id=" + url + "&callback=?";
		} else if (type == 'news') {
			api = "http://www.schwingenonline.ch/api/json/get_recent_posts/?callback=?";
		} else if (type == 'categories') {
			api = "http://www.schwingenonline.ch/api/json/get_category_index/?callback=?";
		} else if (type == 'category') {
			api = "http://www.schwingenonline.ch/api/json/get_category_posts/?slug=" + url + "&callback=?";
		} else {
			return;
		}

		$.ajax({
			url: api,
			type: 'GET',
			dataType: 'json',
			timeout: 5000,
			cache: false,
			success: function(data) {
				store.set(type + '_' + url, data);
				callback(data);
			}
		});
	} else {
		callback(store.get(type + '_' + url));
	}

	return false;
}