/*
 * Stores the app's base URL.
 * @var string
 */
var _base = "http://www.schwingenonline.ch";

/*
 * Stores the app's API path.
 * @var string
 */
var _api = "/api/json/";

/*
 * Stores the initial landing page.
 * @var string
 */
var _home = 'news.recent';

/******************************************************************************
* CONFIGURATION END - DO NOT EDIT LINES BELOW
******************************************************************************/

/*
 * Stores the routing table.
 * @var json
 */
var _routing = null;

/*
 * Stores the loaded templates.
 * @var array
 */
var _tpl = {};

/*
 * Stores various application data.
 * @var array
 */
var _data = {};

/******************************************************************************
* VARIABLE DECLARATIONS END
******************************************************************************/

/**
 * Loads the routing table.
 * Loads routing table from file 'routing.json' and stores in _routing for direct access.
 * @param callback - callback function
 *	-> called after successful loading
 */
function load_routing(callback) {
    $.ajax({
	    url: 'routing.json',
	    dataType: 'json',
	    cache: true
	})
	.done(function(data, status, xhr) {
		_routing = data;

		if (typeof(callback) == typeof(Function)) {
			return( callback() );
		}
    })
    .fail(function(xhr, status, error) {});

    return false;
}

/**
 * Loads the templates.
 * Loads every template file defined in templates into _tpl array for direct access.
 * @param callback - callback function
 *	-> called after successful loading all templates
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

    if (typeof(callback) == typeof(Function)) {
    	return( callback() );
    }

    return false;
}

/******************************************************************************
* STATIC FILE LOADERS END
******************************************************************************/

/**
 * Initializes the application.
 */
function init_app() {
	$(document).on('click', 'a:not([href])', function(e) {
	    e.preventDefault();
	    navigator.notification.activityStart("Laden", "Inhalt wird geladen...");

	    var routing = $(this).data('routing');
	    var identifier = $(this).data('identifier');
	    var tab = $(this).data('tab');
	    var tpl = $(this).data('tpl');

	    process_click(routing, identifier, tab, tpl, hide_loader);
	});

	setTimeout(function () {
		window.localStorage.clear();

		$('#news').find('.tab').click();

		iscroll = new iScroll('iscroll', {
			hScroll: false,
			hScrollbar: false
		});
	}, 500);

	return false;
}

/**
 * Processes click events.
 * Every time a link gets clicked a 'click' event is raised.
 *
 * @param routing - routing information
 * @param identifier - unique identifier
 * @param tab - tab to activate/show content in
 * @param tpl - template to render
 * @param callback - callback function
 *	-> called after successful processing the click
 */
function process_click(routing, identifier, tab, tpl, callback) {
	update_ui(routing, tab);

	if (routing.substring(0, 8) == "internal") {
		// TODO: internal routing handling
		render_tpl(tpl, '', function() {
			if (typeof(callback) == typeof(Function)) {
				return( callback() );
			}
		});
	} else {
		get_data(routing, identifier, function(data) {
			render_tpl(tpl, data, function() {
				if (typeof(callback) == typeof(Function)) {
					return( callback() );
				}
			});
		});
	}

	return false;
}

/**
 * Updates the UI components.
 * Adds and removes classes and states of UI elements.
 *
 * @param routing - current routing state
 * @param tab - tab to activate
 */
function update_ui(routing, tab) {
	setTimeout(function() {
		if (routing == _home) {
			$('.app-icon').removeClass('up').attr('disabled', 'disabled');
			$('.chevron').hide();
		} else {
			$('.app-icon').addClass('up').removeAttr('disabled');
			$('.chevron').show();
		}

		$('.tab').parent().removeClass('active');
		$('#' + tab).addClass('active');
	}, 0);

	return false;
}

/**
 * Returns the data for given URI.
 * Fetchs and returns the data for the given URI and proceeds with callback.
 *
 * @param routing - routing information
 * @param identifier - unique identifier
 * @param callback - callback function
 *	-> called after data have been fetched
 */
function get_data(routing, identifier, callback) {
	var uri = routing + "__" + identifier;
	var storage = window.localStorage.getItem(uri);

	if (storage !== null) {
		var json = $.parseJSON(storage);

		if (typeof(callback) == typeof(Function)) {
			return( callback(json) );
		}
	} else {
		var api = _base + _api;

		var route = routing.split('.');
		var base = route[0];
		var child = route[1];

		var source = api + _routing[base][child];

		if (identifier !== null) {
			source += identifier;
		}

		source += "&callback=?";

		console.log(source);

		fetch_json(source, function(json) {
			var string = JSON.stringify(json);
			window.localStorage.setItem(uri, string);

			return( callback(json) );
		});
	}

	return false;
}

/**
 * Renders the template.
 * Renders the data with given mustache template.
 *
 * @param tpl - template to render
 * @param data - data to render
 * @param callback - callback function
 *	-> called after templates has been rendered
 */
function render_tpl(tpl, data, callback) {
	var output = Mustache.to_html(_tpl[tpl], data, {
		'error': _tpl['error']
	});

	$('#iscroll').html(output);

	if (typeof(callback) == typeof(Function)) {
		return( callback(data) );
	}

	return false;
}

/**
 * Fetchs a JSON from given remove URL.
 * Receivces and fetchs JSON from remote URL and proceeds with callback.
 *
 * @param url - remote origin URL
 * @param callback - callback function
 *	-> called after JSON was fetched
 */
function fetch_json(url, callback) {
	var api = url;

	$.ajax({
		url: api,
		type: 'GET',
		dataType: 'json',
		timeout: 5000,
		cache: true
	})
	.done(function(data, status, xhr) {
		if (typeof(callback) == typeof(Function)) {
			return( callback(data) );
		}
	})
	.fail(function(xhr, status, error) {});

	return false;
}

/**
 * Hides the loading animation.
 * Hides the loader and scrolls back to top to reset previous scolling position.
 */
function hide_loader() {
	// TODO: needs refactoring
	setTimeout(function() {
		navigator.notification.activityStop();
	}, 750);

	setTimeout(function() {
		iscroll.refresh();
		iscroll.scrollTo(0, 0, 0, false);
	}, 500);

	$('#iscroll').waitForImages(function() {
	    iscroll.refresh();
	});
}