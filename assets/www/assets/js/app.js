/**
 * jQuery Document Ready Event.
 *
 * @event ready
 * @param {Event} $ raised event
 */
jQuery(document).ready(function($) {

	var _tpl;
	var _data;

	if (!store.has('recent_posts')) {

		$.ajaxSetup({
			async: false,
			cache: false,
			timeout: 7500
		});

		var api = 'data/recent_posts.json';
		$.getJSON(api)
		.done(function(data, status, xhr) {
			store.set('recent_posts', data);
			_data = data;
		})
		.fail(function(xhr, status, error) {})
		.always(function(data, status, xhr) {});

	} else {
		_data = store.get('recent_posts');
	}

	var output = Mustache.render('<ul class="list"><li class="list-divider">Aktuellste News</li>{{# posts }}<li class="list-item-multi-line"><h3><a href="" post-id="{{ id }}">{{ title_plain }}</a></h3><p>{{ excerpt }}</p></li>{{/ posts }}</ul>', _data);
	$('#main').html(output);

});


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
            success: function(data) {
                tpl[e] = data;
            },
            async: false,
            dataType: 'html'
        });
    });
}