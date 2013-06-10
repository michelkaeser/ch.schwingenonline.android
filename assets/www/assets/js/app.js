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
var _routing = {};

/**
 * Stores the sidepanels table.
 * @var json
 */
var _sidepanels = {};

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
 * Loads the sidepanels table.
 * Loads sidepanels table from file 'sidepanels.json' and stores in _sidepanels for direct access.
 */
function load_sidepanels(callback) {
    $.ajax({
	    url: 'sidepanels.json',
	    dataType: 'json',
	    cache: true
	})
	.done(function(data, status, xhr) {
		_sidepanels = data;
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
		validate_cache();
		init_scroller(true);
		$('#sidr').sidr();
		$('#news').find('.tab').click();
	}, 500);
}

/**
 * Initializes the iScroller.
 *
 * @param use_puller - activates puller is true
 */
function init_scroller(use_puller) {
	var puller = {};

	puller.dom = $('#pullUp');
	pullerOffset = puller.offsetHeight;

	if (use_puller) {
		_iscroll = new iScroll('main', {
			hScroll: false,
			hScrollbar: false,
			vScrollbar: false,
			useTransition: false,
			topOffset: 0,
			onRefresh: function () {
				onScrollerRefresh(puller);
			},
			onScrollMove: function () {
				onScrollerMove(puller);
			},
			onScrollEnd: function () {
				onScrollerEnd(puller);
			}
		});
	} else {
		_iscroll = new iScroll('main', {
			hScroll: false,
			hScrollbar: false,
			vScrollbar: false,
			useTransition: false,
			topOffset: 0
		});
	}
}

/**
 * Processes click events.
 * Every time a link gets clicked a 'click' event is raised.
 *
 * @param dom - clicked dom object
 * @param callback - callback function
 *	-> called after successful processing the click
 */
// FIXME: needs heavy refactoring!!!
function process_click(dom, callback) {
	var data = dom.data();
	var routing = data.routing;
	var identifier = data.identifier;
	var tab = data.tab;
	var tpl = data.tpl;
	var sidepanel = {};

	if (data.sidepanel !== undefined) {
		sidepanel.obj = data.sidepanel;

		if (sidepanel.obj == "inherit") {
			sidepanel.status = "inherit";
		} else {
			sidepanel.status = "true";
		}
	} else {
		sidepanel.status = "false";
	}

	if (routing.substring(0, 8) == "function") {
		var fn = routing.replace("function.", "");

		fn = str_to_function(fn);
		window[fn.fn](fn.args);

		return callback(null);
	} else {
		async.parallel([
		    function(callback) {
		        update_ui(routing, tab, callback);
		    },
		    function(callback) {
		    	process_sidepanel(sidepanel, callback);
		    },
		    function(callback) {
		    	setTimeout(function() {
		    		if (routing.substring(0, 8) == "internal") {
		    			async.waterfall([
		    			    function(callback) {
		    			        render_tpl(tpl, '', '#mustache', callback);
		    			    }
		    			], function (err, result) {
		    				callback(null);
		    			});
		    		} else {
		    			async.waterfall([
		    			    function(callback) {
		    			        get_data(routing, identifier, callback);
		    			    },
		    			    function(arg1, callback) {
		    			        render_tpl(tpl, arg1, '#mustache', callback);
		    			    }
		    			], function (err, result) {
		    				callback(null);
		    			});
		    		}
		    	}, 0);
		    }
		], function(err, results) {
			if (dom.data('puller') !== undefined) {
				var puller = dom.data('puller').split(":");

				var method = puller[0];
				var start = parseInt(puller[1], 10);
				var step = parseInt(puller[2], 10);

				_data.puller = {};
				_data.puller.routing = routing;
				_data.puller.identifier = identifier;
				_data.puller.method = method;
				_data.puller.current = start;

				if (method == "inc") {
					_data.puller.next = start + step;
				} else {
					_data.puller.next = start - step;
				}

				init_scroller(true);
				$('#pullUp').show();
			} else {
				init_scroller(false);
				$('#pullUp').hide();
			}

			return callback(null);
		});
	}
}

/**
 * Processes the sidepanel handling.
 *
 * @param sidepanel - JSON object of sidepanel properties
 * @param callback - callback function
 *	-> called after successful processing the sidepanel tasks
 */
function process_sidepanel(sidepanel, callback) {
	setTimeout(function() {
		var status = sidepanel.status;

		switch (status) {
			case "true":
				var json = _sidepanels[sidepanel.obj];

				async.waterfall([
				    function(callback) {
				        get_data(json.routing, json.identifier, callback);
				    },
				    function(arg1, callback) {
				        render_tpl(json.tpl, arg1, '#sidr', callback);
				    }
				], function (err, result) {
					$('#sidr').removeClass('deactivated');
				});
			case "false":
				$('#sidr').addClass('deactivated');
			default:
				return callback(null);
		}
	}, 0);
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
		var source = get_source(routing, identifier, true);

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
 * @param append_callback - appends &callback=? if true
 * @return source
 */
function get_source(routing, identifier, append_callback) {
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

	if (identifier !== undefined) {
		source += identifier;
	}

	if (append_callback) {
		source += "&callback=?";
	}

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
 * @param callback - callback function
 */
function update_ui(routing, tab, callback) {
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

		return callback(null);
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
	var imgs = $('#mustache').find('img');
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
 * Clears the localStorage cache.
 *
 * @param confirm - weither to show a confirmation prompt or not
 */
function clear_cache(confirm) {
	if (confirm) {
		navigator.notification.confirm(
		    "Möchten Sie den Cache wirklich leeren?",
		    function(btn) {
		        if (btn === 1) {
			        _storage.clear();
		        }
		    },
		    'Cache leeren',
		    'Ja,Nein'
		);
	} else {
		_storage.clear();
	}
}

/**
 * Validates the age of the cache and clears if needed.
 */
function validate_cache() {
	var time = new Date().getTime();
	var cache = _storage.getItem('cache_time');

	if (cache !== null) {
		var diff = time - cache;
		var secs = Math.round(diff / 1000);
		var hours = secs / 360;

		if (hours >= 2) {
			clear_cache(false);
			_storage.setItem('cache_time', time);
		}
	} else {
		_storage.setItem('cache_time', time);
	}
}

/**
 * Divides a function in string form into fn and arguments.
 *
 * @oaram str - string representing the function
 * @return result
 */
function str_to_function(str) {
	var args_s = str.indexOf("(");
	var args_e = str.indexOf(")");

	var fn = str.substring(0, args_s);
	var args = str.substring(args_s + 1, args_e);

	var result = {};
	result.fn = fn;
	result.args = args;

	return result;
}

/******************************************************************************
* HELPER FUNCTIONS END
******************************************************************************/
