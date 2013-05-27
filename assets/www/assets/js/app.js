/**
 * jQuery Document Ready Event.
 *
 * The jQuery document ready event is raised right after jQuery is fully loaded.
 *
 * @event ready
 * @param {Event} $ raised event
 */
jQuery(document).ready(function($) {

    /**
     * Event that gets raised every time a link is clicked.
     *
     * @event click
     * @param {Event} e raised event
     */
    $('a').click(function(e) {
        e.preventDefault();
    });

    /*var data = { name: "Hello" }
    var template = $('#view_home').html();
    var html = Mustache.render(template, data);
    $('#wrap').html(html);*/

});