/**
 * jQuery Document Ready Event.
 *
 * @event ready
 * @param {Event} $ raised event
 */
jQuery(document).ready(function($) {

	$('.ajax-rqst').click(function(e) {
		e.preventDefault();
		processRqst(e);
	});

});

/**
 * Processes the given request/click event.
 *
 * @method processRqst
 * @param {Event} event Event to process.
 */
function processRqst(event) {
	// show loader
	// get URL for clicked object
	// get view that we need to render

	// check if we already have data for it
		// true -> render
		// -> hide loader
		// -> do another rqst in background (only if older than X minutes)
		// false -> get JSON for URL
		// -> render the data in view
		// -> hide loader
		// put JSON into localStorage
}

/**
 * Generates/extracts the URL for given DOM element.
 *
 * @method getURLFromDOM
 * @param {DOM} dom DOM element to get URL from
 */
function getURLFromDOM(dom) {}

/**
 * Extracts the template which will be used to render from DOM object.
 *
 * @method getViewFromDOM
 * @param {DOM} dom DOM element to get the view from
 */
function getViewFromDOM(dom) {}

/**
 * Fetchs the JSON answer for given URL.
 *
 * @method fetchJSONForURL
 * @param {String} url remote URL to get JSON from
 */
function fetchJSONForURL(url) {}

/**
 * Puts the JSON to localStorage.
 *
 * @method putJSONToStorage
 * @param {JSON} json JSON object to put into storage
 * @param {String} name name to use for stored JSON
 */
function putJSONToStorage(json, name) {}

/**
 * Gets the object from localStorage.
 *
 * @method getJSONFromStorage
 * @param {String} name name of JSON to get
 */
function getJSONFromStorage(name) {}

/**
 * Renders the JSON with given Mustache view into DOM object.
 *
 * @method renderJSONToDOM
 * @param {JSON} json data in JSON format
 * @param {Mustache} mustache template to use for rendering
 * @param {DOM} dom DOM object into which the view should be rendered
 */
function renderJSONToDOM(json, view, dom) {}