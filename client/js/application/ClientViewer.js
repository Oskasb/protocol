"use strict";

define([
        'WorkerAPI',
        '3d/SceneController',
		'evt'
    ],
	function(
        WorkerAPI,
        SceneController,
        evt
    ) {

    var i;
    var frame = 0;
    var lastTpf = 0;
    var sceneController;
    var callbacks = [];
    var workerCallbacks = [];
    var callbackFunctions;


        var ClientViewer = function() {

            sceneController = new SceneController();

            var prerenderTick = function(tpf) {
                this.prerenderTick(tpf)
            }.bind(this);

            var postrenderTick = function(tpf) {
                this.tickPostrender(tpf)
            }.bind(this);


            var workerFrameCallback = function(frame) {
                evt.initEventFrame(frame);
                sceneController.tickEnvironment(lastTpf);
            };

            var eventTest = function(e) {
                console.log("Test Event: ", e);
            };

            callbackFunctions = {
                workerFrameCallback:workerFrameCallback,
                prerenderTick:prerenderTick,
                postrenderTick:postrenderTick,
                eventTest:eventTest
            }
		};

        ClientViewer.prototype.initScene = function(ready) {
            //    console.log("tick", tpf)

            sceneController.setup3dScene(ready);

            var instantiate = function(assetClone) {
                console.log("Instantiated:", assetClone);
                ThreeAPI.addToScene(assetClone)
            }

            var onAssetReady = function(asset) {
                console.log("AssetReady:", asset);
                asset.instantiateAsset(instantiate)
            };

            ThreeAPI.buildAsset('asset_tree_1', onAssetReady);
        };


        ClientViewer.prototype.setRenderCallbacksOn = function(on) {

            if (on) {
        //        console.log("++Attach Renderer Callbacks");
                ThreeAPI.getSetup().addPrerenderCallback(callbackFunctions.prerenderTick);
                ThreeAPI.getSetup().addPostrenderCallback(callbackFunctions.postrenderTick);
                workerCallbacks.push(callbackFunctions.workerFrameCallback);
                evt.on(ENUMS.Event.TEST_EVENT, callbacks.eventTest);
            } else {
        //        console.log("--Detach Renderer Callbacks");
                ThreeAPI.getSetup().removePrerenderCallback(callbackFunctions.prerenderTick);
                ThreeAPI.getSetup().removePostrenderCallback(callbackFunctions.postrenderTick);
                workerCallbacks.splice(workerCallbacks.indexOf(callbackFunctions.workerFrameCallback, 1));
                evt.removeListener(ENUMS.Event.TEST_EVENT, callbackFunctions.eventTest);
            }

        };

        var frameMessage = [ENUMS.Message.NOTIFY_FRAME, [frame, lastTpf]];

        ClientViewer.prototype.prerenderTick = function(tpf) {
        //    console.log("tick", tpf)
            lastTpf = tpf;
            frame++;
            ThreeAPI.updateCamera();
            frameMessage[1][0] = frame;
            frameMessage[1][1] = tpf;
            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER, frameMessage)

		};

        var notifyFrameMessage = [];

        ClientViewer.prototype.tickPostrender = function(tpf) {

        //    console.log("tick", frame)
        //    sampleCamera(ThreeAPI.getCamera());

        };

        ClientViewer.prototype.notifyWorkerFrameReady = function(msg) {
            for (i = 0; i < workerCallbacks.length; i++) {
                workerCallbacks[i](msg);
            }
        };

        ClientViewer.prototype.workerMessage = function(msg, workerKey) {

        };

		return ClientViewer;

	});