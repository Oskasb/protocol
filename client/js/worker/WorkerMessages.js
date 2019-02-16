"use strict";



define([
        'ConfigObject'
    ],
    function(
        ConfigObject
    ) {

        var handlers = [];
        var clientViewer;

        var WorkerMessages = function(client) {
            clientViewer = client;
            this.setupMessageHandlers();
        };

        var setupFetcher = function(workerKey, msg) {
            var fetcher = new ConfigObject(msg[0], msg[1], msg[2]);

            var dataUpdated = function(data) {

                if ( typeof(data[msg[2]]) === 'undefined') {
                //    console.log("no data for key", msg[2], data);
                    return;
                }

                WorkerAPI.callWorker(workerKey, [ENUMS.Message.RELAY_CONFIG_DATA, [msg[0], msg[1], msg[2], data[msg[2]]]]);
            };

            fetcher.addCallback(dataUpdated);
        };

        WorkerMessages.prototype.setupMessageHandlers = function() {

            handlers[ENUMS.Message.REQUEST_ASSET] = function(workerKey, msg) {
                clientViewer.getDynamicMain().requestAsset(msg);
            };

            handlers[ENUMS.Message.REMOVE_MODEL_INSTANCE] = function(workerKey, msg) {
                MainWorldAPI.initMainWorldFrame(msg[0], msg[1]);
            };

            handlers[ENUMS.Message.REGISTER_INSTANCING_BUFFERS] = function(workerKey, msg) {
                clientViewer.getDynamicMain().initiateInstancesFromBufferMsg(msg);
            };

            handlers[ENUMS.Message.REGISTER_BUFFER] = function(workerKey, msg) {
            //    console.log("REGISTER_BUFFER", ENUMS.getKey('Worker', workerKey), "->->-> RENDER", msg);
                WorkerAPI.registerSharedBuffer(msg[0], msg[1], msg[2])
            };

            handlers[ENUMS.Message.NOTIFY_FRAME] = function(workerKey, msg) {
            //    console.log("NOTIFY_FRAME", ENUMS.getKey('Worker', workerKey), "->->-> RENDER", msg)
                clientViewer.notifyWorkerFrameReady(msg)
            };

            handlers[ENUMS.Message.REGISTER_PORT] = function(workerKey, msg) {
                console.log("REGISTER_PORT", ENUMS.getKey('Worker', workerKey), "->->-> RENDER", msg)
            };

            handlers[ENUMS.Message.INIT_RENDERER] = function(workerKey, msg) {
                clientViewer.setRenderCallbacksOn(msg[0]);
            //    console.log("INIT_RENDERER", ENUMS.getKey('Worker', workerKey), "->->-> RENDER", msg[0])
            };

            handlers[ENUMS.Message.RELAY_CONFIG_DATA] = function(workerKey, msg) {
                setupFetcher(workerKey, msg);
            };

            handlers[ENUMS.Message.WORLD_READY] = function(workerKey, msg) {
                clientViewer.worldReady();
                //    console.log("INIT_RENDERER", ENUMS.getKey('Worker', workerKey), "->->-> RENDER", msg[0])
            };

            handlers[ENUMS.Message.TERRAIN_BUFFERS] = function(workerKey, msg) {
                console.log("Terrain Buffers: ", msg)
                ThreeAPI.buildTerrainFromBuffers(msg.buffers, msg.pos[0], msg.pos[1], msg.pos[2])
            }



        };

        WorkerMessages.prototype.handleWorkerMessasge = function(workerKey, e) {
            handlers[e.data[0]](workerKey, e.data[1])
        };

        return WorkerMessages;
    });
