"use strict";

define([
        'WorkerAPI',
        '3d/SceneController',
        '3d/DynamicMain',
		'evt'
    ],
	function(
        WorkerAPI,
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

        var instantiate = function(instancedModel) {
        //    console.log("Instantiated:", assetClone);
            var obj3d = instancedModel.obj3d;

            if (instancedModel.animator) {
                var keys = instancedModel.animator.actionKeys;
                var animKey = keys[Math.floor(Math.random() * keys.length)];
                instancedModel.playAnimation(animKey, Math.random()+0.4, 0.4 + Math.random()*0.6);
                dynamicMain.activateMixer(instancedModel.animator.mixer)
            }

            obj3d.position.x += (0.5-Math.random())*40
            obj3d.position.z += (0.5-Math.random())*40
            ThreeAPI.addToScene(obj3d)

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