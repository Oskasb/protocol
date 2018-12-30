"use strict";

define([
    'application/DataLoader',
    'io/PointerCursor',
    'PipelineAPI'
], function(
    DataLoader,
    PointerCursor,
    PipelineAPI
) {

    var dataLoader;

    var Setup = function() {

    };

    Setup.init = function(onReady) {
        console.log(PipelineAPI.getCachedConfigs());
        dataLoader = new DataLoader();
        dataLoader.loadData(onReady)
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
