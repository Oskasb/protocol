"use strict";

define([
        'workers/main/camera/WorldCamera'
    ],
    function(
        WorldCamera
    ) {

        var WorldSimulation = function() {
            this.worldCamera = new WorldCamera();
        };

        WorldSimulation.prototype.tickWorldSimulation = function(tpf) {
            this.worldCamera.tickWorldCamera(tpf);
        };

        return WorldSimulation;
    });

