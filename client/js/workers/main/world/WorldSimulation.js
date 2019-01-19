"use strict";

define([
        'workers/main/camera/WorldCamera'
    ],
    function(
        WorldCamera
    ) {

        var worldStatus = {
            randomSpawn:false
        };

        var worldEntities = [];
        var addEntities = [];

        var worldSimulation;
        var worldUdateCallbacks = [];

        var WorldSimulation = function() {
            this.worldCamera = new WorldCamera();
            worldSimulation = this;
        };

        WorldSimulation.prototype.getWorldStatus = function() {
            return worldStatus;
        };

        WorldSimulation.prototype.readWorldStatusValue = function(key) {
            return worldStatus[key];
        };


        WorldSimulation.prototype.startWorldSystem = function(cameraAspect) {
            this.worldCamera.getCamera().aspect = cameraAspect;
            GuiAPI.setCameraAspect(cameraAspect);
        };


        WorldSimulation.prototype.tickWorldSimulation = function(tpf) {
            this.worldCamera.tickWorldCamera(tpf);
        };


        WorldSimulation.prototype.addWorldEntity = function(worldEntity) {
            addEntities.push(worldEntity)
        };

        var e;

        WorldSimulation.prototype.addNewEntities = function(time) {
            while (addEntities.length) {
                e = addEntities.pop();
                e.initWorldEntity(time);

                worldEntities.push(e);

                if (e.isCharacter()) {
                    for (var i = 0; i < worldEntities.length; i++) {
                        if (worldEntities[i].isItem()) {
                            if (!worldEntities[i].attachedTo) {
                                if (worldEntities[i].getSkin().skeleton_key === e.getSkin().skeleton_key) {
                                    if (e.checkSlotFree(worldEntities[i].getSkin().slot)) {
                                        e.attachItem(worldEntities[i]);
                                    //    return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };


        WorldSimulation.prototype.despawnRandomEntity = function() {

            var we = worldEntities.shift();

            we.decommissionWorldEntity();

        };

        WorldSimulation.prototype.addWorldStepCallback = function(callback) {
            if (worldUdateCallbacks.indexOf(callback) === -1) {
                worldUdateCallbacks.push(callback);
            } else {
                console.log("worldUdateCallbacks already contains", [callback])
            }
        };

        WorldSimulation.prototype.removeWorldStepCallback = function(callback) {
            MATH.quickSplice(worldUdateCallbacks, callback);
        };

        var cbs;

        WorldSimulation.prototype.triggerWorldCallbacks = function(tpf, time) {

            for (cbs = 0; cbs < worldUdateCallbacks.length; cbs++) {
                worldUdateCallbacks[cbs](tpf, time);
            }
        };

        var assetsInitiated = false;

        WorldSimulation.prototype.randomSpawnSpam = function(time) {

            if (!assetsInitiated) {
                GameAPI.getGameAssets().loadPossibleAssets();
                assetsInitiated = true;
                return;
            }



            if (Math.random()*15+72 < worldEntities.length) {
                this.despawnRandomEntity();
                this.despawnRandomEntity();
            }

            if (Math.random() < 0.3) {
                GameAPI.getGameAssets().spamRandomAssets();
                GameAPI.getGameAssets().spamRandomAssets();
            } else {

            }
        };

        WorldSimulation.prototype.tickWorldSimulation = function(tpf, time) {

            this.worldCamera.tickWorldCamera(tpf);

            this.addNewEntities(time);

            if (this.readWorldStatusValue('randomSpawn')) {
                this.randomSpawnSpam(time);
            }

            this.triggerWorldCallbacks(tpf, time);

        };


        return WorldSimulation;
    });

