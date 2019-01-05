"use strict";

define([
    'application/load/DataLoader',
    'io/PointerCursor',
    'PipelineAPI'
], function(
    DataLoader,
    PointerCursor,
    PipelineAPI
) {

    var dataLoader;
    console.log('CONFIGS RENDER:', PipelineAPI.getCachedConfigs());

    var Setup = function() {

    };

    Setup.init = function(onReady) {
        dataLoader = new DataLoader();
        dataLoader.loadData(onReady);
        new PointerCursor();
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
