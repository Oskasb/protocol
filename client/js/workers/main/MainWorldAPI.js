"use strict";

var MainWorldAPI;

define([
        'workers/main/MainWorldCom',
    'evt'
    ],
    function(
        MainWorldCom,
        evt
    ) {

        var key;
        var mainWorldCom;

        MainWorldAPI = function() {};

        var sharedBuffers = {};

        MainWorldAPI.initMainWorld = function(workerIndex) {
            mainWorldCom = new MainWorldCom();
            mainWorldCom.initWorldCom(workerIndex)
        };

        MainWorldAPI.postMessage = function(msg) {
            postMessage(msg)
        };

        MainWorldAPI.processMessage = function(e) {
            mainWorldCom.handleWorldComMessage(e)
        };

        var testArgs = [ENUMS.Args.FRAME, 0];

        MainWorldAPI.initMainWorldFrame = function(frame) {
        //    console.log("FRAME ->->-> MainWorldCom");
            evt.initEventFrame(frame);

            testArgs[1] = frame;
            if (Math.random() < 0.1) {
                evt.fire(ENUMS.Event.TEST_EVENT, testArgs);

                if (Math.random() < 0.5) {
                    testArgs[1] = Math.random();
                    evt.fire(ENUMS.Event.TEST_EVENT, testArgs);
                    testArgs[1] = Math.random();
                    evt.fire(ENUMS.Event.TEST_EVENT, testArgs);
                    testArgs[1] = Math.random();
                    evt.fire(ENUMS.Event.TEST_EVENT, testArgs);
                    testArgs[1] = Math.random();
                    evt.fire(ENUMS.Event.TEST_EVENT, testArgs);
                }

            }

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

        MainWorldAPI.getSharedBuffers = function() {
            return sharedBuffers;
        };

        return MainWorldAPI;
    });

