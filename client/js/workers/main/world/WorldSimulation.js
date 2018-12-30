"use strict";

var MainWorldAPI;

define([
        'workers/main/camera/WorldCamera'
    ],
    function(
        WorldCamera
    ) {

        var key;
        var mainWorldCom;

        var WorldSimulation = function() {
            this.worldCamera = new WorldCamera();
        };

        WorldSimulation.prototype.tickWorldSimulation = function(tpf) {

        };

        return WorldSimulation;
    });

