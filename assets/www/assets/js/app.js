/**
 * Stores the app's base URL.
 * @var string
 */
var _base = "http://www.schwingenonline.ch/";

/**
 * Stores the app's API path.
 * @var string
 */
var _api = "api/json/";

/**
 * Stores the initial landing page.
 * @var string
 */
var _home = 'news.recent';

/******************************************************************************
* CONFIGURATION END - DO NOT EDIT LINES BELOW
******************************************************************************/

/**
 * Stores the routing table.
 * @var json
 */
var _routing;

/**
 * Stores the loaded templates.
 * @var array
 */
var _tpl = {};

/**
 * Stores the localStorage object.
 * @var object
 */
var _storage = window.localStorage;

/**
 * Stores various application data.
 * @var array
 */
var _data = {};

/**
 * Stores the iScroll object.
 * @var object
 */
var _iscroll;

/******************************************************************************
* VARIABLE DECLARATIONS END
******************************************************************************/

/**
 * Loads the routing table.
 * Loads routing table from file 'routing.json' and stores in _routing for direct access.
 */
function load_routing(callback) {
    $.ajax({
	    url: 'routing.json',
	    dataType: 'json',
	    cache: true
	})
	.done(function(data, status, xhr) {
		_routing = data;
		return callback(null);
    })
    .fail(function(xhr, status, error) {
    	return callback(true);
    });
}

/**
 * Loads the templates.
 * Loads every template file defined in templates into _tpl array for direct access.
 */
function load_templates(callback) {
    var templates = [
    	'athlete',
    	'athlets',
    	'categories',
    	'error',
    	'events',
    	'news',
    	'post',
    	'search',
    	'search_results',
    	'settings'
    ];

    $.each(templates, function(i, e) {
    	$.ajax({
	    	url: 'tpl/' + e + '.mustache',
	    	dataType: 'html',
	    	cache: true
	    })
	    .done(function(data, status, xhr) {
	    	_tpl[e] = data;

	    	if (i == templates.length - 1) {
	    		return callback(null);
	    	}
    	})
    	.fail(function(xhr, status, error) {
    		return callback(true);
    	});
    });
}

/******************************************************************************
* STATIC FILE LOADERS END
******************************************************************************/

/**
 * Initializes the application.
 */
function init_app() {
	setTimeout(function() {
		$('#sidr').sidr();

		_iscroll = new iScroll('main', {
			hScroll: false,
			hScrollbar: false,
			vScrollbar: false
		});

		$('#news').find('.tab').click();
	}, 500);
}

/**
 * Processes click events.
 * Every time a link gets clicked a 'click' event is raised.
 *
 * @param dom - clicked dom object
 * @param callback - callback function
 *	-> called after successful processing the click
 */
// FIXME: needs refactoring!!!
function process_click(dom, callback) {
	var routing = dom.data('routing');
	var identifier = dom.data('identifier');
	var tab = dom.data('tab');
	var tpl = dom.data('tpl');
	var sidepanel = dom.data('sidepanel');

	if (sidepanel !== undefined && sidepanel != "inherit") {
		async.waterfall([
		    function(callback) {
		        get_data(sidepanel.routing, sidepanel.identifier, callback);
		    },
		    function(arg1, callback) {
		        render_tpl(sidepanel.tpl, arg1, '#sidr', callback);
		    }
		], function (err, result) {
			$('#sidr').removeClass('deactivated');
			// TODO: include sidepanel waterfall in normal waterfall
		});
	} else if (sidepanel != "inherit") {
		$('#sidr').addClass('deactivated');
	}

	if (routing.substring(0, 8) == "function") {
		var fn = routing.replace("function.", "");

		window[fn](identifier);
		return callback(null);
	} else {
		update_ui(routing, tab);

		if (routing.substring(0, 8) == "internal") {
			async.waterfall([
			    function(callback) {
			        render_tpl(tpl, '', '#scroller', callback);
			    }
			], function (err, result) {
				return callback(null);
			});
		} else {
			async.waterfall([
			    function(callback) {
			        get_data(routing, identifier, callback);
			    },
			    function(arg1, callback) {
			        render_tpl(tpl, arg1, '#scroller', callback);
			    }
			], function (err, result) {
				return callback(null);
			});
		}
	}
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
	var uri = routing;

	if (identifier !== undefined && identifier !== '') {
		uri += "__" + identifier;
	}

	var storage = _storage.getItem(uri);

	if (storage !== null) {
		var json = $.parseJSON(storage);
		return callback(null, json);
	} else {
		var source = get_source(routing, identifier);

		async.waterfall([
		    function(callback) {
		        fetch_json(source, callback);
		    }
		], function (err, result) {
			var string = JSON.stringify(result);
			_storage.setItem(uri, string);

			return callback(null, result);
		});
	}
}

/**
 * Returns a JSON error object.
 * @param msg - error message
 * @return err
 */
function get_error(msg) {
	var err = $.parseJSON('{"error": "true", "error_msg": "' + msg + '"}');

	return err;
}

/**
 * Returns the source for given route.
 * Returns the source from routing.json for given route.
 * @param routing - the routing path
 * @return source
 */
function get_source(routing, identifier) {
	var api = _base + _api;
	var route = routing.split('.');
	var base = route[0];
	var object = _routing[base];
	var child;

	for (var i = 1; i < route.length; ++i) {
		child = route[i];
		object = object[child];
	}

	var source = api + object;

	if (identifier !== null) source += identifier;
	source += "&callback=?";

	return source;
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
		return callback(null, data);
	})
	.fail(function(xhr, status, error) {
		var data = get_error("Der Server lieferte keine Daten.");
		return callback(null, data);
	});
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
function render_tpl(tpl, data, dom, append, callback) {
	setTimeout(function () {
		var output = Mustache.to_html(_tpl[tpl], data, {
			'error': _tpl['error']
		});

		if (typeof(append) === typeof(Function)) {
			callback = append;
			$(dom).html(output);
		} else {
			$(dom).append(output);
		}

		if (typeof(callback) === typeof(Function)) {
			return callback(null);
		}
	}, 0);
}

/******************************************************************************
* MAIN FUNCTIONS END
******************************************************************************/

/**
 * Updates the UI components.
 * Adds and removes classes and states of UI elements.
 *
 * @param routing - current routing state
 * @param tab - tab to activate
 */
function update_ui(routing, tab) {
	setTimeout(function() {
		$.sidr('close');

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
}

/**
 * Waits until images are loaded.
 * Waites until all images (if any) are loaded.
 *
 * @param callback - callback function
 *	-> called after images have been loaded
 */
function wait_for_images(callback) {
	var imgs = $('#scroller').find('img');
	var length = imgs.length;
	var counter = 0;

	if (length > 0) {
		imgs.each(function() {
			if (this.complete) {
				counter++;
			} else {
				$(this).load(function() {
					counter++;

					if (counter == length) {
						return callback(null);
					}
				});
			}

			if (counter == length) {
				return callback(null);
			}
		});
	} else {
		return callback(null);
	}
}

/**
 * Updates the scroller.
 * Updates the scoller and scrolls back to top.
 *
 * @param callback - callback function
 *	-> called after scroller has been updated
 */
function update_scroller(callback) {
	setTimeout(function() {
		_iscroll.refresh();
		_iscroll.scrollTo(0, 0, 25);

		return callback(null);
	}, 0);
}

/**
 * Clears the localStorage cache.
 */
function clear_cache() {
	_storage.clear();
}

/******************************************************************************
* HELPER FUNCTIONS END
******************************************************************************/
