# ch.schwingenonline.android

Simple Android application for Schwingenonline.ch to receive the latest news.

## Overview

The project is realized with PhoneGap/Cordova and fetchs the data through Wordpress's JSON API plugin. It can therefor be adapted to other projects relative easily by changeing the `_base` and `_api` URL in `app.js`.

Furthermore, all routing is done in `routing.js` - so adding own controllers is easy.

Wordpress JSON API plugin: [https://github.com/adwins04/wp-json-api](https://github.com/adwins04/wp-json-api)

## Used Resources

**async**: Async utilities for node and the browser    
**Used for** async processing of clicks (UI, fetch JSON etc.).    
[https://github.com/caolan/async](https://github.com/caolan/async)

**Fries**: Fries helps you prototype Android apps using HTML, CSS, and JavaScript.    
**Used for** getting the Holo look & feel.    
[https://github.com/jaunesarmiento/fries](https://github.com/jaunesarmiento/fries)

**iScroll**: Smooth scrolling for the web    
**Used for** smooth and native-like scrolling.    
[https://github.com/cubiq/iscroll](https://github.com/cubiq/iscroll)

**jQuery**: jQuery JavaScript Library    
**Used for** nearly everything.    
[https://github.com/jquery/jquery](https://github.com/jquery/jquery)

**mustache.js**: Minimal templating with {{mustaches}} in JavaScript    
**Used for** rendering the views.    
[https://github.com/janl/mustache.js](https://github.com/janl/mustache.js)

**QuoJS**: Micro #JavaScript Library for Mobile Devices    
**Used for** touch gestures.    
[https://github.com/soyjavi/QuoJS](https://github.com/soyjavi/QuoJS)

**sidr**: Sidr is a jQuery plugin for creating side menus and the easiest way for doing your menu responsive.    
**Used for** sliding panels.    
[https://github.com/artberri/sidr](https://github.com/artberri/sidr)