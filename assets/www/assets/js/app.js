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
 * Stores the preferences object.
 *
 * @since 2.6.4
 *
 * @var {Object}
 */
var _preferences;

/**
 * Stores the localStorage (cache) object.
 *
 * @since 2.6.1
 *
 * @var {Object}
 */
var _storage = window.localStorage;

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
 * Stores the iScroll object.
 *
 * @see init_scroller()
 * @since 2.6.1
 *
 * @var {Object}
 */
var _iscroll;

/**
 * Stores the puller object.
 *
 * @see process_puller()
 * @since 2.6.1
 */
var _puller = {};

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
 * @triggers process_content()
 * @triggers process_puller()
 * @sets _data.puller
 */
function process_click(dom, callback) {
	var rqst = {};
	var data = dom.data();

	rqst.routing = data.routing;
	rqst.identifier = data.identifier;
	rqst.tab = data.tab;
	rqst.tpl = data.tpl;
	rqst.sidepanel = {};
	rqst.puller = {};

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

	// define puller status
	if (data.puller !== undefined) {
		rqst.puller.obj = data.puller;
		rqst.puller.status = "true";
	} else {
		rqst.puller.status = "false";
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
		    	process_sidepanel(rqst.sidepanel, callback);
		    },
		    function(callback) {
		    	// the puller should not be visible until the content has loaded
		    	// therefor we need to wait for process_content before
		    	// proceeding with it
		    	async.waterfall([
		    	    function(callback) {
		    	        process_content(rqst, callback);
		    	    },
		    	    function(callback) {
		    	        process_puller(rqst, callback);
		    	    }
		    	], function (err, result) {
		    		callback(null);
		    	});
		    }
		], function(err, results) {
			return callback(null);
		});
	}
}

/**
 * Processes the content changing.
 * This function checks the type of needed interaction (e.g. change DOM, call function)
 * and fetches data for the new content if required.
 * Additionally, the data is rendered into view.
 * Primary triggered by process_click()
 *
 * @since 2.6.1
 *
 * @param rqst {Object} request to process
 * @param callback {Function} callback function
 * @returns callback {Function} callback function
 *   -> when the content has been processed
 */
function process_content(rqst, callback) {
	setTimeout(function() {
		// internal views don't reply on external data
		// -> render directly
		if (rqst.routing.substring(0, 8) == "internal") {
			async.waterfall([
			    function(callback) {
			        render_tpl(rqst.tpl, '', '#mustache', callback);
			    }
			], function (err, result) {
				return callback(null);
			});
		} else {
			async.waterfall([
			    function(callback) {
			        get_data(rqst, callback);
			    },
			    function(arg1, callback) {
			        render_tpl(rqst.tpl, arg1, '#mustache', callback);
			    }
			], function (err, result) {
				return callback(null);
			});
		}
	}, 0);
}

/**
 * Processes the puller handling.
 * This function checks if a puller is needed for the current requests and builds
 * it if needed by setting the _data var.
 * Pullers can be set in HTML with data-puller="inc:1:1" where
 * the first part is the method (inc|dec), followed by starting identifier and
 * inc-/decrementation step.
 *
 * @since 2.6.1
 *
 * @param rqst {Object} request to process
 * @param callback {Function} callback function
 * @returns callback {Function} callback function
 *   -> when the puller has been processed
 * @sets _puller
 */
function process_puller(rqst, callback) {
	setTimeout(function() {
		var status = rqst.puller.status;
		var puller = $('#pullUp');

		switch (status) {
			case "true":
				var splitted = rqst.puller.obj.split(":");

				var method = splitted[0];
				var start = parseInt(splitted[1], 10);
				var step = parseInt(splitted[2], 10);

				_puller.routing = rqst.routing;
				_puller.identifier = rqst.identifier;
				_puller.identifier_raw = rqst.identifier;
				_puller.tpl = rqst.tpl;
				_puller.method = method;
				_puller.current = parseInt(splitted[1], 10);

				if (method == "inc") {
					_puller.next = start + step;
				} else {
					_puller.next = start - step;
				}

				puller.show();
			break;
			case "false":
				puller.hide();
			break;
		}

		init_scroller(status === "true");

		return callback(null);
	}, 0);
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
				        get_data(json, callback);
				    },
				    function(arg1, callback) {
				        render_tpl(json.tpl, arg1, '#sidr', callback);
				    }
				], function (err, result) {
					$('#sidr').removeClass('deactivated');
				});

				return callback(null);
			break;
			case "false":
				$('#sidr').addClass('deactivated');
				return callback(null);
			break;
			default:
				return callback(true);
		}
	}, 0);
}

/******************************************************************************
* PROCESSOR FUNCTIONS END
******************************************************************************/

/**
 * Returns the data for given URI (routing + identifier).
 * This function is primary triggered by process_click() and delivers
 * the data used to render the template.
 * localStorage is looked up to search content first. If nothing is found,
 * a fetch_json() request is fired and the result stored in cache for future
 * access.
 *
 * @since 2.6.1
 *
 * @param rqst {String} request to get the data for
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the data has been fetched
 * @sets _storage
 * @triggers fetch_json()
 */
function get_data(rqst, callback) {
	var uri = rqst.routing;
	var identifier = rqst.identifier;

	if (identifier !== undefined && identifier !== '') {
		uri += "__" + identifier;
	}

	var storage = _storage.getItem(uri);

	if (storage !== null) {
		var json = $.parseJSON(storage);
		return callback(null, json);
	} else {
		var source = get_source(rqst, true);

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
 * Returns an error object for use in templates.
 * Use it to display errors when something goes wrong, e.g. fetching remote data.
 * When "error" is set, the according notification gets activated in tpl/error.mustache.
 *
 * @since 2.6.1
 *
 * @param mst {String} error message to display
 * @return err {JSON} error object
 */
function get_error(msg) {
	var err = $.parseJSON('{"error": "true", "error_msg": "' + msg + '"}');

	return err;
}

/**
 * Returns the source for given URI (routing + identifier).
 * The source is looked up from _routing which represents the JSON object
 * found in routing.json.
 * Use this function to get the URL from it for given request.
 *
 * @see _routing
 * @see get_data()
 * @since 2.6.1
 *
 * @param rqst {String} request to get the data for
 * @param append_callback {Boolean} appends &callback=? if true
 * @return source {String} combined source URL
 */
function get_source(rqst, append_callback) {
	var api = _base + _api;
	var route = rqst.routing.split('.');
	var base = route[0];
	var object = _routing[base];
	var child;

	for (var i = 1; i < route.length; ++i) {
		child = route[i];
		object = object[child];
	}

	var source = api + object;

	if (rqst.identifier !== undefined) {
		source += rqst.identifier;
	}

	if (append_callback) {
		source += "&callback=?";
	}

	return source;
}

/**
 * Fetches the remote's answer JSON object.
 * If the data could not be fetched an error is triggered and shown to user.
 * Use get_source() and get_data() and avoid calling this function directly.
 *
 * @since 2.6.1
 *
 * @param url {String} remote server URL
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the data has been fetched
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
 * Applies the stored app preferences.
 * In order to get all the properties you can call the load method.
 * The success callback of the load method will be called with a JSONObject
 * which contains all the preferences.
 *
 * @since 2.7.1
 */
function apply_preferences(prefs) {
	if (prefs == null) {
		_preferences.load(function(prefs) {
			var color_scheme = prefs.color_scheme;

			if (color_scheme == 'holo_light') {
				$('body').addClass('holo-light');
			} else {
				$('body').removeClass('holo-light');
			}
	    }, function(error) {
			//alert("Error! " + JSON.stringify(error));
		});
	} else {
		var color_scheme = prefs.color_scheme;

		if (color_scheme == 'holo_light') {
			$('body').addClass('holo-light');
		} else {
			$('body').removeClass('holo-light');
		}
	}
}

/**
 * Shows the preferences activity.
 * The preferences are bridged to native library using Cordova plugin.
 * See: https://github.com/macdonst/AppPreferences for more information.
 *
 * @since 2.7.0
 */
function showPreferencesActivity() {
	_preferences.show("ch.schwingenonline.app.PreferencesActivity", function(prefs) {
		apply_preferences(prefs);
    }, function(error) {
		//alert("Error! " + JSON.stringify(error));
	});
}

/******************************************************************************
* PREFERENCES FUNCTIONS END
******************************************************************************/

/**
 * Clears the localStorage cache.
 * Triggered by validata_cache() if needed.
 *
 * @since 2.6.1
 *
 * @param confirm {Boolean} shows confirmation prompt if set
 * @sets _storage
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
	var lifetime;

	_preferences.get('cache_lifetime', function(value) {
		lifetime = value;
	}, function() {
		lifetime = 1;
	});

	if (cache !== null) {
		var diff = time - cache;
		var secs = Math.round(diff / 1000);
		var hours = secs / 360;

		if (hours >= lifetime) {
			clear_cache(false);
			_storage.setItem('cache_time', time);
		}
	} else {
		_storage.setItem('cache_time', time);
	}
}

/**
 * Waits for all images to be fully loaded.
 *
 * @since 2.6.1
 *
 * @param callback {Function} callback function
 * @return callback {Function} callback function
 *   -> when the images have been loaded
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
