"use strict";

define([
        'WorkerAPI',
        'PipelineAPI',
        '3d/SceneController',
        '3d/DynamicMain',
		'evt'
    ],
	function(
        WorkerAPI,
        PipelineAPI,
        SceneController,
        DynamicMain,
        evt
    ) {

    var i;
    var frame = 0;
    var lastTpf = 0;
    var sceneController;
    var callbacks = [];
    var workerCallbacks = [];
    var callbackFunctions;

    var dynamicMain;


        var ClientViewer = function() {

            sceneController = new SceneController();
            dynamicMain = new DynamicMain();


            var prerenderTick = function(tpf) {
                this.prerenderTick(tpf)
            }.bind(this);

            var postrenderTick = function(tpf) {
                this.tickPostrender(tpf)
            }.bind(this);


            var workerFrameCallback = function(frame) {
                evt.initEventFrame(frame);
                dynamicMain.tickDynamicMain(lastTpf);
                dynamicMain.tickPrerenderDynamics(lastTpf);

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

        ClientViewer.prototype.getDynamicMain = function() {
            return dynamicMain;
        };


        ClientViewer.prototype.initScene = function(ready) {
            //    console.log("tick", tpf)
            sceneController.setup3dScene(ready);

        };

        ClientViewer.prototype.setRenderCallbacksOn = function(on) {

            if (on) {
        //        console.log("++Attach Renderer Callbacks");
                ThreeAPI.getSetup().addPrerenderCallback(callbackFunctions.prerenderTick);
                ThreeAPI.getSetup().addPostrenderCallback(callbackFunctions.postrenderTick);
                workerCallbacks.push(callbackFunctions.workerFrameCallback);
            } else {
        //        console.log("--Detach Renderer Callbacks");
                ThreeAPI.getSetup().removePrerenderCallback(callbackFunctions.prerenderTick);
                ThreeAPI.getSetup().removePostrenderCallback(callbackFunctions.postrenderTick);
                workerCallbacks.splice(workerCallbacks.indexOf(callbackFunctions.workerFrameCallback, 1));
            }

        };

        var frameMessage = [ENUMS.Message.NOTIFY_FRAME, [frame, lastTpf]];

        ClientViewer.prototype.prerenderTick = function(tpf) {
        //    console.log("tick", tpf)

            lastTpf = tpf;
            frame++;
            ThreeAPI.updateCamera();


		};

        var notifyFrameMessage = [];

        ClientViewer.prototype.tickPostrender = function(tpf) {
            frameMessage[1][0] = frame;
            frameMessage[1][1] = lastTpf;
            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER, frameMessage)
        //    console.log("tick", frame)
        //    sampleCamera(ThreeAPI.getCamera());

        };

        ClientViewer.prototype.notifyWorkerFrameReady = function(msg) {
            for (i = 0; i < workerCallbacks.length; i++) {
                workerCallbacks[i](msg);
            }

            PipelineAPI.tickPipelineAPI(lastTpf)

        };

        ClientViewer.prototype.workerMessage = function(msg, workerKey) {

        };

		return ClientViewer;

	});