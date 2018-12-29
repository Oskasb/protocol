"use strict";

define([
        'worker/WorkerMessages'
    ],
    function(
        WorkerMessages
    ) {

        var workerMessages;
        var workers = [];
        var urlMap = [];

        urlMap[ENUMS.Worker.PHYSICS_WORLD] = './client/js/workers/PhysicsWorldWorker.js';
        urlMap[ENUMS.Worker.STATIC_WORLD] = './client/js/workers/StaticWorldWorker.js';
        urlMap[ENUMS.Worker.MAIN_WORKER] = './client/js/workers/MainWorldWorker.js';

        var WorkerRunner = function(clientViewer) {
            workerMessages = new WorkerMessages(clientViewer);
        };

        WorkerRunner.prototype.initWorker = function(workerKey, callback) {

            if (workers[workerKey]) {
                console.log("already initiated... BAILING");
                return;
            }

            var setupWorker = function(url, key, cb) {

                console.log('Init for URL!', url);

                var worker = new Worker(url);

                var mc = new MessageChannel();
                workers[key] = {
                    worker:worker,
                    mc:mc,
                    port:mc.port1
                };

                console.log('REG for Key URL!', key, url);
                worker.postMessage(url, [workers[key].mc.port2]);

                cb(workers[key], key);

            };

            setupWorker(urlMap[workerKey], workerKey, callback);

        };

        WorkerRunner.prototype.postToWorker = function(workerKey, msg, transfer) {
            workers[workerKey].port.postMessage(msg, transfer);
        };

        WorkerRunner.prototype.recieveFromWorker = function(workerKey, e) {
            if (typeof(e.data[0]) === 'number') {
                workerMessages.handleWorkerMessasge(workerKey, e)
            } else {
                console.log("Non Numerical meesage from: ", ENUMS.getKey('Worker', workerKey), "->->-> RENDER", e.data);
            }

        };

        return WorkerRunner;
    });
