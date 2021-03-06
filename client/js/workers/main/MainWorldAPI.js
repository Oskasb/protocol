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

            var uiSetupReady = function() {
                uiSetup.setupDefaultUi()
                mainWorldCom.initWorldCom(workerIndex);
            };

            var uiReady = function() {
                uiSetup.initUiSetup(uiSetupReady)
            };


            var simReady = function() {
                GuiAPI.initGuiApi(uiReady)
            };


            worldSimulation = new WorldSimulation(simReady);
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

        var pollingOn = false;
        var speedPoll;

        var sampleInput = function() {
            GuiAPI.sampleInputState(sharedBuffers[ENUMS.getKey('BufferType', ENUMS.BufferType.INPUT_BUFFER)][0]);

            if (samples > 10) {
                GuiAPI.printDebugText("--> STOP ui loop "+Math.round(time));
            //    console.log("--> clear ui sample loop");
                clearInterval(speedPoll);
                samples = 0;
                pollingOn = false;
                return;
            }

            if (samples === 0) {
                if (!pollingOn) {
                    GuiAPI.printDebugText("++> START ui loop "+Math.round(time));
                    pollingOn = true;
                    speedPoll = setInterval(sampleInput, 10)
                }
            }

            samples++;
        };

        var now;
        var entT;
        var startT
        MainWorldAPI.initMainWorldFrame = function(frame, frameTpf) {


            frameEndMsg[1] = frame;

        //    GuiAPI.printDebugText(frame)

        //    console.log("FRAME ->->-> MainWorldCom");

            worldSimulation.worldCamera.tickWorldCamera();

            evt.initEventFrame(frame);

            postMessage(frameEndMsg);

            sampleInput();
            GuiAPI.updateGui(tpf, time);

            EffectAPI.updateEffectAPI();
            DebugAPI.updateDebugApi();


            let evtStats = evt.getEventSystemStatus();
            DebugAPI.generateTrackEvent('W_EVT_MG', evtStats['message_count'], 0, 0);
            DebugAPI.generateTrackEvent('EVT_LOAD', evtStats['write_load'], '%', 1);

            samples = 0;


        /*

            GameAPI.updateGame(tpf, time);
*/

            DebugAPI.generateTrackEvent('WORK_DT', MATH.getNowMS() - startT, 'ms', 2);

            DebugAPI.generateTrackEvent('LOAD_W', MATH.percentify(MATH.getNowMS() - startT, frameTpf*1000), '%',  1);


            entT = MATH.getNowMS();

        };


        MainWorldAPI.generateWorldFrame = function(frame, frameTpf) {

            startT = MATH.getNowMS();
            DebugAPI.generateTrackEvent('IDLE_W', startT - entT, 'ms', 2);

            tpf = frameTpf;
            time += tpf;

            worldSimulation.tickWorldSimulation(tpf , time );

            GameAPI.updateGame(tpf, time);

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

        MainWorldAPI.getHeightAtPosition = function(pos, normalStore) {
            return  worldSimulation.getTerrainHeightAt(pos, normalStore);
        };

        MainWorldAPI.addWorldUpdateCallback = function(callback) {
            worldSimulation.addWorldStepCallback(callback);
        };

        MainWorldAPI.removeWorldUpdateCallback = function(callback) {
            worldSimulation.removeWorldStepCallback(callback);
        };

        MainWorldAPI.getWorldSimulation = function() {
            return worldSimulation;
        };

        MainWorldAPI.getSuitableSpawnPoint = function(pos) {
            return worldSimulation.getWorldSpawnPoint(pos);
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

