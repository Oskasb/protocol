"use strict";

define([
        'WorkerAPI',
		'evt',
        'ThreeAPI'
    ],
	function(
        WorkerAPI,
        evt,
        ThreeAPI
    ) {

    var frame = 0;

    var callbacks;

        var ClientViewer = function() {

            var prerenderTick = function(tpf) {
                this.prerenderTick(tpf)
            }.bind(this);

            var postrenderTick = function(tpf) {
                this.tickPostrender(tpf)
            }.bind(this);


            var eventTest = function(e) {
                console.log("Test Event: ", e);
            };

            callbacks = {
                prerenderTick:prerenderTick,
                postrenderTick:postrenderTick,
                eventTest:eventTest
            }
		};

        ClientViewer.prototype.setRenderCallbacksOn = function(on) {

            if (on) {
                console.log("++Attach Renderer Callbacks");
                ThreeAPI.getSetup().addPrerenderCallback(callbacks.prerenderTick);
                ThreeAPI.getSetup().addPostrenderCallback(callbacks.postrenderTick);
                evt.on(ENUMS.Event.TEST_EVENT, callbacks.eventTest);
            } else {
                console.log("--Detach Renderer Callbacks");
                ThreeAPI.getSetup().removePrerenderCallback(callbacks.prerenderTick);
                ThreeAPI.getSetup().removePostrenderCallback(callbacks.postrenderTick);
                evt.removeListener(ENUMS.Event.TEST_EVENT, callbacks.eventTest);
            }

        };

        ClientViewer.prototype.prerenderTick = function(tpf) {
        //    console.log("tick", tpf)
            evt.initEventFrame(frame);
            ThreeAPI.updateCamera();
		};

        var notifyFrameMessage = []

        ClientViewer.prototype.tickPostrender = function(tpf) {
            frame++;

        //    console.log("tick", frame)
        //    sampleCamera(ThreeAPI.getCamera());
            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER, [ENUMS.Message.NOTIFY_FRAME, frame])
        };

        ClientViewer.prototype.tickWorkerPing = function(msg) {

        };

        ClientViewer.prototype.workerMessage = function(msg, workerKey) {

        };

		return ClientViewer;

	});