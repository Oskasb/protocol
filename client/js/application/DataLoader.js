"use strict";


define([
        'application/PipelineObject',
        'ui/dom/DomLoadScreen',
        'ui/GameScreen',
        'PipelineAPI',
        'ThreeAPI'
    ],
    function(
        PipelineObject,
        DomLoadScreen,
        GameScreen,
        PipelineAPI,
        ThreeAPI
    ) {

        var loadProgress;

        var pipelineOn = pollingOn;
        window.jsonConfigUrls = 'client/json/';
        if (window.location.href === 'http://127.0.0.1:5000/' || window.location.href ===  'http://localhost:5000/' || window.location.href ===  'http://192.168.0.100:5000/') {
            //    pipelineOn = true;
        }

        var dataPipelineSetup = {
            "jsonPipe":{
                "polling":{
                    "enabled":pipelineOn,
                    "frequency":45
                }
            },
            "svgPipe":{
                "polling":{
                    "enabled":false,
                    "frequency":2
                }
            },
            "imagePipe":{
                "polling":{
                    "enabled":false,
                    "frequency":1
                }
            }
        };

        var jsonRegUrl = './client/json/config_urls.json';

        var setDebug = function(key, data) {
            SYSTEM_SETUP.DEBUG = data;
        };

        var DataLoader = function() {

        };

        var loadStates= {
            SHARED_FILES:'SHARED_FILES',
            CONFIGS:'CONFIGS',
            THREEDATA:'THREEDATA',
            IMAGES:'IMAGES',
            COMPLETED:'COMPLETED'
        };

        var loadState = loadStates.SHARED_FILES;

        DataLoader.prototype.getStates = function() {
            return loadStates;
        };

        DataLoader.prototype.setupPipelineCallback = function(loadStateChange) {

        };

        DataLoader.prototype.loadData = function(onReady) {

            loadProgress = new DomLoadScreen(GameScreen.getElement());

            var _this = this;

            var loadingCompleted = function() {
                onReady();
            };

            var loadStateChange = function(state) {
                //    console.log('loadStateChange', state)
                if (state === _this.getStates().IMAGES) {

                }

                if (state === _this.getStates().COMPLETED) {
                    loadState = loadStates.THREEDATA;
                    loadingCompleted()
                }

            };


            function pipelineCallback(started, remaining, loaded, files) {
             //    console.log("SRL", loadState, started, remaining, loaded, [files]);

                PipelineAPI.setCategoryKeyValue("STATUS", "FILE_CACHE", loaded);

                loadProgress.setProgress(loaded / started);


                if (loadState === loadStates.THREEDATA) {
                //    console.log( "loadThreeData:", loadState, started, remaining, loaded, [files]);
                 //   loadState = loadStates.COMPLETED;
                 //   loadStateChange(loadState);
                }

                if (loadState === loadStates.CONFIGS && remaining === 0) {
                //    console.log( "json cached:", PipelineAPI.getCachedConfigs());
                    loadState = loadStates.COMPLETED;
                //    ThreeAPI.loadThreeData(ThreeAPI);
                    loadStateChange(loadState);
                }

                if (loadState === loadStates.SHARED_FILES && remaining === 0) {
                //    console.log( "shared loaded....");
                    loadState = loadStates.CONFIGS;

                    loadStateChange(loadState);
                }
            }

            PipelineAPI.addProgressCallback(pipelineCallback);

            var loadJsonData = function() {

                function pipelineError(src, e) {
                    console.log("Pipeline error Ready", src, e);
                }
                PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);

            };

            _this.setupPipelineCallback(loadStateChange);
            loadJsonData();

        };

        DataLoader.prototype.loadShaderData = function() {
            ThreeAPI.loadShaders();
        };

        DataLoader.prototype.notifyCompleted = function() {
            loadProgress.removeProgress();
        };

        return DataLoader;

    });