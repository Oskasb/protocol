"use strict";

define([
        'workers/DataFetcher'
    ],
    function(
        DataFetcher
    ) {

        var key;
        var handlers = [];
        var workerIndex;


        var getNextSharedBufferIndex = function(bufferType) {
            key = ENUMS.getKey('BufferType', bufferType);
            var sabs = MainWorldAPI.getSharedBuffers();
            if (!sabs[key]) {
                sabs[key] = [];
            }
            return sabs[key].length;
        };

        var setupBufferMessage = function(size, bufferType) {
            var sab = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * size);
            var buffer = new Float32Array(sab);
            var bufferIndex = getNextSharedBufferIndex(bufferType);

            var msg = [buffer, bufferType, bufferIndex];
            MainWorldAPI.registerSharedBuffer(msg[0], msg[1], msg[2]);
            MainWorldAPI.postMessage([ENUMS.Message.REGISTER_BUFFER, msg])
        };

        var determineEventBufferSize = function() {
            var size = 0;
            for (key in ENUMS.Worker) {
                size += ENUMS.Numbers.event_buffer_size_per_worker
            }
            return size;
        };

        var MainWorldCom = function() {
            this.setupMessageHandlers();
        };

        MainWorldCom.prototype.initWorldCom = function(wIndex) {
            workerIndex = wIndex;
            this.registerComBuffers()
        };

        MainWorldCom.prototype.registerComBuffers = function() {
            var size = determineEventBufferSize();
            setupBufferMessage(size, ENUMS.BufferType.EVENT_DATA);
            setupBufferMessage(size, ENUMS.BufferType.EVENT_DATA);
            setupBufferMessage(size, ENUMS.BufferType.EVENT_DATA);
            setupBufferMessage(ENUMS.InputState.BUFFER_SIZE * (ENUMS.Numbers.POINTER_TOUCH0 + ENUMS.Numbers.TOUCHES_COUNT), ENUMS.BufferType.INPUT_BUFFER);
        };

        MainWorldCom.prototype.setupMessageHandlers = function() {

            handlers[ENUMS.Message.REGISTER_ASSET] = function(msg) {
                GameAPI.getGameAssets().registerAssetReady(msg);
            };

            handlers[ENUMS.Message.NOTIFY_FRAME] = function(msg) {
                MainWorldAPI.initMainWorldFrame(msg[0], msg[1]);
            };

            handlers[ENUMS.Message.RENDERER_READY] = function(msg) {
                console.log("RENDERER_READY", "->->-> MainWorldCom", msg);
                MainWorldAPI.getWorldSimulation().startWorldSystem(msg[1]);
                MainWorldAPI.postMessage([ENUMS.Message.INIT_RENDERER, [msg[0]]])
            };

            handlers[ENUMS.Message.RELAY_CONFIG_DATA] = function(msg) {
                DataFetcher.setConfigData(msg);
            }
        };

        MainWorldCom.prototype.handleWorldComMessage = function(e) {

            if (typeof(e.data[0]) === 'number') {
                handlers[e.data[0]](e.data[1])
            } else {
                console.log("Non Numerical message:", "->->-> MainWorldCom", e.data);
            }
        };


        MainWorldCom.prototype.setupConfigDataCallback = function(category, key, dataId, callback) {
            DataFetcher.fetchConfigData(category, key, dataId, callback)
        };

        return MainWorldCom;
    });