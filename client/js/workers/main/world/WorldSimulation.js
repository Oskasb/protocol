"use strict";

define([
        'workers/WorkerData',
        'workers/main/camera/WorldCamera',
        'worker/terrain/TerrainSystem',
        'workers/main/world/vegetation/Vegetation',
        'worker/physics/PhysicsWorldAPI'
    ],
    function(
        WorkerData,
        WorldCamera,
        TerrainSystem,
        Vegetation,
        pwAPI
    ) {

        var worldStatus = {
            randomSpawn:false
        };

        var worldEntities = [];
        var addEntities = [];

        var worldSimulation;
        var worldUdateCallbacks = [];

        var WorldSimulation = function(simReady) {

            MATH.setCalcVec(new THREE.Vector3());

            this.terrainSystem = new TerrainSystem();
            this.vegetation = new Vegetation();
            this.worldCamera = new WorldCamera();
            worldSimulation = this;

            var fxReady = function() {
                this.vegetation.initVegetation("grid_default", new WorkerData('VEGETATION', 'GRID'),  new WorkerData('VEGETATION', 'PLANTS') ,simReady);
            }.bind(this);

            var pReady = function(x) {
                console.log("PhysicsReady", x)

                EffectAPI.initEffectAPI(fxReady)
            };

            PhysicsWorldAPI.initPhysicsWorld(pReady);


        };

        WorldSimulation.prototype.getWorldStatus = function() {
            return worldStatus;
        };


        WorldSimulation.prototype.getWorldSpawnPoint = function(intendedPos) {
            var area = this.terrainSystem.getTerrainAreaAtPos(intendedPos);
            tempVec.copy(intendedPos);
            area.getRandomPointOnTerrain(tempVec, tempVec2, 0.1, 1000, 0.9);
            return tempVec;

        };

        WorldSimulation.prototype.readWorldStatusValue = function(key) {
            return worldStatus[key];
        };

        WorldSimulation.prototype.addVegetationPatch = function(patchConfig, pos) {
            this.vegetation.addVegetationAtPosition(patchConfig, pos, this.terrainSystem)
        };

        var tempVec = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        WorldSimulation.prototype.startWorldSystem = function(cameraAspect) {

            this.worldCamera.getCamera().aspect = cameraAspect;
            GuiAPI.setCameraAspect(cameraAspect);

            var veg = this.vegetation;
            var ts = this.terrainSystem;
            this.terrainSystem.generateTerrainArea();
            tempVec.set(0, 0, 0);

            var area = ts.getTerrainAreaAtPos(tempVec);
            veg.vegetateTerrainArea(area);
            PhysicsWorldAPI.addTerrainToPhysics(area);
        };

        WorldSimulation.prototype.getTerrainHeightAt = function(pos, normalStore) {
            return this.terrainSystem.getTerrainHeightAndNormal(pos, normalStore)
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

            PhysicsWorldAPI.callPhysicsSimulationUpdate(tpf);



            this.vegetation.updateVegetation(tpf, time, this.worldCamera);

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

