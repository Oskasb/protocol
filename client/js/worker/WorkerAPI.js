"use strict";

var WorkerAPI;

define([
    'PipelineAPI',
        'worker/WorkerRunner',
    'evt'

    ],
    function(
        PipelineAPI,
        WorkerRunner,
        evt
    ) {

        var workerRunner;

        var key;

        WorkerAPI = function() {};

        var sharedBuffers = {};

        var configs;

        WorkerAPI.initWorkers = function(clientViewer) {
            configs = PipelineAPI.getCachedConfigs();
            configs.BUFFERS = sharedBuffers;
            workerRunner = new WorkerRunner(clientViewer);
        };

        WorkerAPI.requestWorker = function(workerKey, callback) {
            workerRunner.initWorker(workerKey, callback);
        };

        WorkerAPI.buildMessage = function(protocolKey, data) {
            return [protocolKey, data];
        };

        WorkerAPI.callWorker = function(workerKey, msg, transfer) {
            workerRunner.postToWorker(workerKey, msg, transfer);
        };

        WorkerAPI.processMessage = function(workerKey, e) {
            workerRunner.recieveFromWorker(workerKey, e);
        };

        WorkerAPI.registerSharedBuffer = function(buffer, bufferType, bufferIndex) {
            key = ENUMS.getKey('BufferType', bufferType);

            if (!sharedBuffers[key]) {
                sharedBuffers[key] = [];
            }

            sharedBuffers[key][bufferIndex] = buffer;

            if (bufferType === ENUMS.BufferType.EVENT_DATA) {
                evt.setEventBuffers(sharedBuffers[key], ENUMS.Worker.RENDER);
            }
        };

        WorkerAPI.getSharedBuffers = function() {
            return sharedBuffers;
        };

        return WorkerAPI;
    });

