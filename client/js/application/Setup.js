"use strict";

define([
    'io/PointerCursor',
    'PipelineAPI'
], function(
    PointerCursor,
    PipelineAPI
) {

    var dataLoader;

    var Setup = function() {

    };

    Setup.init = function(onReady) {

    };

    Setup.completed = function() {
        dataLoader.notifyCompleted();
    };


    Setup.enableJsonPipelinePolling = function() {
        PipelineAPI.getPipelineOptions('jsonPipe').polling.enabled = true;
        PipelineAPI.getPipelineOptions('jsonPipe').polling.frequency = 45;
    };

    return Setup;

});
