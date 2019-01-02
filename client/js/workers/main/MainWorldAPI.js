"use strict";

var MainWorldAPI;

define([

        'workers/main/MainWorldCom',
        'workers/main/world/WorldSimulation',
        'evt'
    ],
    function(

        MainWorldCom,
        WorldSimulation,
        evt
    ) {

        var key;
        var mainWorldCom;
        var worldSimulation;

        MainWorldAPI = function() {};


        var sharedBuffers = {};

        MainWorldAPI.initMainWorld = function(workerIndex) {
            mainWorldCom = new MainWorldCom();
            mainWorldCom.initWorldCom(workerIndex);
            worldSimulation = new WorldSimulation();
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

        var testArgs = [ENUMS.Args.FRAME, 0];

        var frameEndMsg = [ENUMS.Message.NOTIFY_FRAME]

        var tpf;
        var time = 0;

        MainWorldAPI.initMainWorldFrame = function(frame, frameTpf) {
            tpf = frameTpf;
            time += tpf;
        //    console.log("FRAME ->->-> MainWorldCom");
            evt.initEventFrame(frame);

            GuiAPI.updateGui(sharedBuffers[ENUMS.getKey('BufferType', ENUMS.BufferType.INPUT_BUFFER)][0], tpf);

            worldSimulation.tickWorldSimulation(tpf, time);

            /*
            testArgs[1] = frame;
            if (Math.random() < 0.05) {
                evt.fire(ENUMS.Event.TEST_EVENT, testArgs);

                if (Math.random() < 0.5) {
                    testArgs[1] = Math.random();
                    evt.fire(ENUMS.Event.TEST_EVENT, testArgs);
                    testArgs[1] = Math.random();
                    evt.fire(ENUMS.Event.TEST_EVENT, testArgs);
                }
            }
            */
            frameEndMsg[1] = frame;
            postMessage(frameEndMsg)

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

