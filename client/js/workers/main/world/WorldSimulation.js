"use strict";

define([
        'workers/main/camera/WorldCamera',
        'worker/terrain/TerrainSystem'
    ],
    function(
        WorldCamera,
        TerrainSystem
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
            this.terrainSystem = new TerrainSystem();

            this.worldCamera.getCamera().aspect = cameraAspect;
            GuiAPI.setCameraAspect(cameraAspect);

            this.terrainSystem.generateTerrainArea();
        };

        WorldSimulation.prototype.getTerrainHeightAt = function(pos, normalStore) {
            return this.terrainSystem.getTerrainHeightAndNormal(pos, normalStore)
        };

        WorldSimulation.prototype.tickWorldSimulation = function(tpf) {
            this.worldCamera.tickWorldCamera(tpf);
        };

        WorldSimulation.prototype.getWorldCameraDirection = function() {
            return this.worldCamera.getCameraDirection();
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
            }
        };


        WorldSimulation.prototype.despawnRandomEntity = function() {

            var we = worldEntities.shift();

            we.decommissionWorldEntity();

        };

        WorldSimulation.prototype.despawnWorldEntity = function(worldEntity) {
            MATH.quickSplice(worldEntities, worldEntity);
            worldEntity.decommissionWorldEntity();
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

        var tempVec1 = new THREE.Vector3();

        WorldSimulation.prototype.tickWorldSimulation = function(tpf, time) {

            this.worldCamera.tickWorldCamera(tpf);

            this.addNewEntities(time);

            if (this.readWorldStatusValue('randomSpawn')) {

                for (var i = 0; i < worldEntities.length; i++) {
                    //    if (Math.random() < 0.1) {
                    worldEntities[i].getWorldEntityPosition(tempVec1);
                    tempVec1.x += (Math.sin(time ))*0.1+ Math.random()*0.06*tempVec1.x;
                    tempVec1.z += (Math.cos(time ))*0.1+ Math.random()*0.06*tempVec1.y;
                    worldEntities[i].setWorldEntityPosition(tempVec1);
                }
                this.randomSpawnSpam(time);
            }


            for (var i = 0; i < worldEntities.length; i++) {
                worldEntities[i].updateWorldEntity();
            }

            this.triggerWorldCallbacks(tpf, time);

        };


        return WorldSimulation;
    });

