/*
 * onLoad() - loaded first on each page load
 *****************************************************************************/

function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}


/*
 * onDeviceReady() - fires by onLoad() as soon as cordova is ready
 *****************************************************************************/

function onDeviceReady() {
    document.addEventListener('backbutton', onBackKeyDown, false);
    document.addEventListener('menubutton', onMenuKeyDown, false);
    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
}