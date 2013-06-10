/**
 * The 'app.js' file is meant for the main application logic and variable declaration.
 * -----
 * The whole logic is placed in this file as well as global scoped variables.
 * Per-page functionality on the other side should be placed directly into the page's
 * template or a separate file.
 *
 * @author Michel Käser <mk@frontender.ch>
 */

/**
 * Stores the app's base URL.
 *
 * @var {String}
 */
var _base = "http://www.schwingenonline.ch/";

/**
 * Stores the app's API URI.
 *
 * @var {String}
 */
var _api = "api/json/";

/**
 * Stores the initial landing page route.
 *
 * @see routing.json
 * @var {String}
 */
var _home = 'news.recent';

/******************************************************************************
* CONFIGURATION END - DO NOT EDIT LINES BELOW
******************************************************************************/

/**
 * Stores the routing table.
 *
 * @see routing.json
 * @see load_routing()
 * @since 2.6.1
 *
 * @var {JSON}
 */
var _routing = {};

/**
 * Stores the sidepanels table.
 *
 * @see sidepanels.json
 * @see load_sidepanels()
 * @since 2.6.1
 *
 * @var {JSON}
 */
var _sidepanels = {};

/**
 * Stores the loaded templates.
 *
 * @see tpl/*.mustache
 * @see load_templates()
 * @since 2.6.1
 *
 * @var {Object}
 */
var _tpl = {};

/**
 * Stores the localStorage (cache) object.
 *
 * @since 2.6.1
 *
 * @var {Object}
 */
var _storage = window.localStorage;

/**
 * Stores various application data.
 * If you need to store data you should place them in here rather than creating
 * new objects or using cookies.
 *
 * @since 2.6.1
 *
 * @var {Object}
 */
var _data = {};

/**
 * Stores the iScroll object.
 *
 * @see init_scroller()
 * @since 2.6.1
 *
 * @var {Object}
 */
var _iscroll;

/******************************************************************************
* VARIABLE DECLARATIONS END
******************************************************************************/

/**
 * Loads the routing table from file into global variable.
 * Routes are defined in routing.json but read at app init.
 * Direct access is faster and more elegant.
 *
 * @since 2.6.1
 *
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the routing.json file has been loaded
 * @sets _routing
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
 * Loads the sidepanels table from file into global variable.
 * Sidepanels are defined in sidepanels.json but read at app init.
 * Direct access is faster and more elegant.
 *
 * @since 2.6.1
 *
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the sidepanels.json file has been loaded
 * @sets _sidepanels
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
 * Loads the templates from file into global variable.
 * Templates are defined in tpl/ but read at app init.
 * Direct access is faster and more elegant.
 *
 * @since 2.6.1
 *
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the templates have been loaded
 * @sets _tpl
 */
function load_templates(callback) {
    var templates = [
    	'athlete',
    	'athletes',
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
 * As soon as everything has been loaded, cordova.js\onDeviceReady() triggers
 * this function.
 * Used to initially check the cache and click on a link to load it's content.
 * Wrapped into setTimeout() as not doing so caused problems.
 *
 * @since 2.6.1
 *
 * @triggers init_scroller()
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
 * Initializes the scroller.
 * This inits the iScroll object. iScroll is used for smooth and native-like scrolling
 * experience as well as pull-to-refresh feature.
 * The function is triggers by process_click() every time an app internal link is clicked.
 *
 * @see _iscoll;
 * @since 2.6.1
 *
 * @param use_puller {Boolean} to use pull-to-refresh or not
 * @sets _iscroll;
 * @triggers onScrollerRefresh()
 * @triggers onScrollerMove()
 * @triggers onScrollerEnd()
 */
function init_scroller(use_puller) {
	var puller = {};

	puller.dom = $('#pullUp');
	puller.offset = puller.dom.offsetHeight;

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

/******************************************************************************
* INITIALIZER FUNCTIONS END
******************************************************************************/

/**
 * Processes the link click.
 * This function does the most magic and is fired by the on.click event
 * in events.js every time an app internal link is clicked.
 * It receives the JSON respond from remote server (if needed), renders the view,
 * and builds the sidepanel.
 *
 * @since 2.6.1
 *
 * @param dom {Object} clicked DOM object
 * @param callback {Function} callback function
 * @returns callback {Function} callback function
 *   -> when the click has been processed, e.g. hide loader
 * @triggers update_ui()
 * @triggers process_sidepanel()
 * @triggers get_data()
 * @triggers render_tpl()
 * @triggers init_scroller()
 * @sets _data.puller
 */
function process_click(dom, callback) {
	var rqst = {};
	var data = dom.data();

	var rqst.routing = data.routing;
	var rqst.identifier = data.identifier;
	var rqst.tab = data.tab;
	var rqst.tpl = data.tpl;
	var rqst.sidepanel = {};

	// define sidepanel status
	if (data.sidepanel !== undefined) {
		rqst.sidepanel.obj = data.sidepanel;

		if (rqst.sidepanel.obj == "inherit") {
			rqst.sidepanel.status = "inherit";
		} else {
			rqst.sidepanel.status = "true";
		}
	} else {
		rqst.sidepanel.status = "false";
	}

	// function calls are cheap and only need to be fired
	// no get_data and render_tpl needed
	if (rqst.routing.substring(0, 8) == "function") {
		var fn = rqst.routing.replace("function.", "");

		fn = str_to_function(fn);
		window[fn.fn](fn.args);

		return callback(null);
	} else {
		// parallel processing of functions since they don't depend on each other
		// however, all need to finish before we can process -> otherwise we would
		// display half-finished results
		async.parallel([
		    function(callback) {
		        update_ui(rqst, callback);
		    },
		    function(callback) {
		    	process_sidepanel(sidepanel, callback);
		    },
		    function(callback) {
		    	// TODO: outsource to external fn
		    	setTimeout(function() {
		    		// internal views don't reply on external data
		    		// -> render directly
		    		if (rqst.routing.substring(0, 8) == "internal") {
		    			async.waterfall([
		    			    function(callback) {
		    			        render_tpl(rqst.tpl, '', '#mustache', callback);
		    			    }
		    			], function (err, result) {
		    				callback(null);
		    			});
		    		} else {
		    			async.waterfall([
		    			    function(callback) {
		    			        get_data(rqst.routing, rqst.identifier, callback);
		    			    },
		    			    function(arg1, callback) {
		    			        render_tpl(rqst.tpl, arg1, '#mustache', callback);
		    			    }
		    			], function (err, result) {
		    				callback(null);
		    			});
		    		}
		    	}, 0);
		    }
		], function(err, results) {
			// TODO: refactor!!!
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
 * Processes the sidepanel rendering.
 * The sidepanel can be used to show additional information/links for a given page
 * and is defined through data-sidepanel which should point to a JSON object in
 * sidepanels.json.
 * The processing is much like process_click.
 *
 * @see _sidepanels
 * @since 2.6.1
 *
 * @param sidepanel {String} name of the JSON sidepanel object
 * @param callback {Function} callback function
 * @returns callback {Function} callback function
 *   -> when the click has been processed, e.g. hide loader
 * @triggers get_data()
 * @triggers render_tpl()
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

/******************************************************************************
* PROCESSOR FUNCTIONS END
******************************************************************************/

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
 * Renders the Mustache template.
 * Renders the given Mustache template stored in _tpl with the given data into given DOM object.
 * This funtion is triggered by every process_click that's not an internal function call.
 * When using pull-to-refresh the rendered result should be appended rather than override existing
 * content.
 * Define template with data-tpl in HTML.
 *
 * @see _tpl;
 * @since 2.6.1
 *
 * @param tpl {String} name of the template to use
 * @param data {Object} data to render
 * @param dom {String} DOM object into which the render result should be added
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the template has been rendered
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

/**
 * Updates the UI components.
 * After every click the UI needs to be updated. Therefor this function is triggered/called
 * by process_click.
 * It closes the sidepanel, updates the app-icon in actionbar and sets the active tab.
 *
 * @since 2.6.1
 *
 * @param rqst {Object} requested/target link/content
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the UI has been updated
 */
function update_ui(rqst, callback) {
	setTimeout(function() {
		$.sidr('close');

		if (rqst.routing == _home) {
			$('.app-icon').removeClass('up').attr('disabled', 'disabled');
			$('.chevron').hide();
		} else {
			$('.app-icon').addClass('up').removeAttr('disabled');
			$('.chevron').show();
		}

		$('.tab').parent().removeClass('active');
		$('#' + rqst.tab).addClass('active');

		return callback(null);
	}, 0);
}

/******************************************************************************
* MAIN FUNCTIONS END
******************************************************************************/

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
 * Splits the given string into function name and arguments.
 * Links with data-routing="function.XY" can be used to call internal functions.
 * This is useful e.g. to clear the cache.
 *
 * @since 2.6.1
 *
 * @param str {String} function call string
 * @return result {Object} the splitted fn/args
 */
function str_to_function(str) {
	var result = {};

	var args_s = str.indexOf("(");
	var args_e = str.indexOf(")");

	var fn = str.substring(0, args_s);
	var args = str.substring(args_s + 1, args_e);

	result.fn = fn;
	result.args = args;

	return result;
}

/**
 * Validates the age of the cache.
 * Since we cache JSON responds in localStorage we need to make sure it
 * gets refreshed from time to time. This function checks if the cache is
 * older than two hours and purges/clears if true.
 *
 * @see _storage
 * @since 2.6.1
 *
 * @triggers clear_cache()
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

/******************************************************************************
* HELPER FUNCTIONS END
******************************************************************************/
