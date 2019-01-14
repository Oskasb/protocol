"use strict";

var MainWorldAPI;

define([
        'PipelineAPI',
        'workers/main/ui/UiSetup',
        'workers/main/MainWorldCom',
        'workers/main/world/WorldSimulation',
        'evt'
    ],
    function(
        PipelineAPI,
        UiSetup,
        MainWorldCom,
        WorldSimulation,
        evt
    ) {

        var key;
        var mainWorldCom;
        var worldSimulation;

        var uiSetup = new UiSetup();

        MainWorldAPI = function() {};


        var sharedBuffers = {};

        MainWorldAPI.initMainWorld = function(workerIndex) {
            console.log('CONFIGS WORLD:', PipelineAPI.getCachedConfigs());
            mainWorldCom = new MainWorldCom();
            mainWorldCom.initWorldCom(workerIndex);
            worldSimulation = new WorldSimulation();

            var uiSetupReady = function() {
                uiSetup.setupDefaultUi()
            };

            var uiReady = function() {
                uiSetup.initUiSetup(uiSetupReady)
            };

            GuiAPI.initGuiApi(uiReady)
        };

        MainWorldAPI.postMessage = function(msg) {
            postMessage(msg)
        };

        MainWorldAPI.processMessage = function(e) {
            mainWorldCom.handleWorldComMessage(e)
        };

        MainWorldAPI.getTpf = function() {
            return tpf;
        };

        MainWorldAPI.fetchConfigData = function(category, key, dataId, callback) {
            mainWorldCom.setupConfigDataCallback(category, key, dataId, callback)
        };

        var testArgs = [ENUMS.Args.FRAME, 0];

        var frameEndMsg = [ENUMS.Message.NOTIFY_FRAME]

        var tpf;
        var time = 0;

        var samples = 0;

        var speedPoll;

        var sampleInput = function() {
            GuiAPI.sampleInputState(sharedBuffers[ENUMS.getKey('BufferType', ENUMS.BufferType.INPUT_BUFFER)][0]);

            if (samples > 10) {
                clearInterval(speedPoll);
                samples = 0;
                return;
            }

            if (samples === 1) {
                speedPoll = setInterval(sampleInput, 5)
            }

            samples++;
        };

        MainWorldAPI.initMainWorldFrame = function(frame, frameTpf) {
            tpf = frameTpf;

            frameEndMsg[1] = frame;

            time += tpf;
        //    console.log("FRAME ->->-> MainWorldCom");

            evt.initEventFrame(frame);
            postMessage(frameEndMsg);

            samples++;
            sampleInput();

            GuiAPI.updateGui(tpf, time);

            worldSimulation.tickWorldSimulation(tpf, time);



        };

        MainWorldAPI.registerSharedBuffer = function(buffer, bufferType, bufferIndex) {
            key = ENUMS.getKey('BufferType', bufferType);

            if (!sharedBuffers[key]) {
                sharedBuffers[key] = [];
            }

            sharedBuffers[key][bufferIndex] = buffer;

            if (bufferType === ENUMS.BufferType.EVENT_DATA) {
                evt.setEventBuffers(sharedBuffers[key], ENUMS.Worker.MAIN_WORKER);
            }

        };

        MainWorldAPI.getWorldSimulation = function() {
            return worldSimulation;
        };

        MainWorldAPI.getSharedBuffers = function() {
            return sharedBuffers;
        };

        MainWorldAPI.getSharedBuffer = function(bufferType, index) {
            return sharedBuffers[ENUMS.getKey('BufferType', bufferType)][index];
        };

        MainWorldAPI.readBufferValue = function(bufferType, index, param) {
            return sharedBuffers[ENUMS.getKey('BufferType', bufferType)][index][param];
        };

        MainWorldAPI.postToRender = function(message) {
            postMessage(message)
        };

        return MainWorldAPI;
    });

