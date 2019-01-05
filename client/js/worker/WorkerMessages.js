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
            console.log("Fetcher Added: ", msg);
            var dataUpdated = function(data) {
                console.log("Fetcher Data Updated: ", data);
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

            handlers[ENUMS.Message.REGISTER_UI_BUFFERS] = function(workerKey, msg) {
                clientViewer.getDynamicMain().initiateUiFromBufferMsg(msg);
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
            }

            handlers[ENUMS.Message.RELAY_CONFIG_DATA] = function(workerKey, msg) {
                console.log("fetch data: ", workerKey, msg);
                setupFetcher(workerKey, msg);
            }

        };

        WorkerMessages.prototype.handleWorkerMessasge = function(workerKey, e) {
            handlers[e.data[0]](workerKey, e.data[1])
        };

        return WorkerMessages;
    });
