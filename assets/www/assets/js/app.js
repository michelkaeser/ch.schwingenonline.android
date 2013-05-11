/*
 * onLoad() - loaded first on each page load
 *****************************************************************************/

function onLoad() {
	// add cordova eventListener for deviceReady
    document.addEventListener('deviceready', onDeviceReady, false);

    // initialize some global variables
    backButtonAction = null;
}


/*
 * onDeviceReady() - fires by onLoad() as soon as cordova is ready
 *****************************************************************************/

function onDeviceReady() {
    // add various cardova eventListeners
    document.addEventListener('backbutton', onBackKeyDown, false);
    document.addEventListener('menubutton', onMenuKeyDown, false);
    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
}


/*
 * jQuery document ready
 *****************************************************************************/

 $(document).ready(function() {
    // we hide default content until jQuery is ready
    $('@modal-box--loading').hide();

    // clickEvent for actiobar-menu--togglers
    $('@actionbar-menu--toggler').click(function(e) {
        var target = $(this).data('target');
        $(this).toggleClass('active');
        $('*[data-name="'+ target +'"]').toggle();

        $(this).data('back', 'true');
        backButtonAction = ".click()";
    });
});