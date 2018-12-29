"use strict";

require([
    'WorkerAPI',
    'ThreeAPI',
    'application/Setup',
    'application/SystemDetector',
    'application/ClientViewer',
    'ui/GameScreen'
], function(
    WorkerAPI,
    ThreeAPI,
    Setup,
    SystemDetector,
    ClientViewer,
    GameScreen
) {

    var clientViewer;

    GameScreen.registerAppContainer(document.body);

    new SystemDetector();

    var init = function() {

        clientViewer = new ClientViewer();
        ThreeAPI.initThreeScene(GameScreen.getElement(), 1, false);


        var mainWorkerCallback = function(worker, key) {
            console.log("Worker Setup:", worker, key);

            worker.port.onmessage = function(e) {
                WorkerAPI.processMessage(key, e)
            };

            worker.port.postMessage([ENUMS.Message.RENDERER_READY, 1]);
        };

        WorkerAPI.initWorkers(clientViewer);
        WorkerAPI.requestWorker(ENUMS.Worker.MAIN_WORKER, mainWorkerCallback);
    };

    setTimeout(init, 10)

});
