"use strict";


define([
    'application/debug/StatusMonitor'
], function(
    StatusMonitor
) {

    var SetupDebug = function() {
        new StatusMonitor()
    };

    return SetupDebug;

});