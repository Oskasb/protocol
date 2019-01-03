"use strict";



define([
        'evt'
    ],
    function(
        evt
    ) {

        var handlers = [];
        var clientViewer;

        var WorkerMessages = function(client) {
            clientViewer = client;
            this.setupMessageHandlers();
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

        };

        WorkerMessages.prototype.handleWorkerMessasge = function(workerKey, e) {
            handlers[e.data[0]](workerKey, e.data[1])
        };

        return WorkerMessages;
    });
