"use strict";

var PhysicsWorldAPI;

define([
        'worker/physics/AmmoAPI',
        'worker/physics/WaterPhysics',
        'worker/physics/AirPhysics',
        'worker/physics/ShapePhysics',
        'worker/physics/DynamicSpatial'
    ],
    function(
        AmmoAPI,
        WaterPhysics,
        AirPhysics,
        ShapePhysics,
        DynamicSpatial
    ) {

    var comBuffer;
        var ammoApi;
        var waterPhysics;
        var airPhysics;
        var protocolRequests;
        var worldMessages;
        var fetches = {};

        var tpf;
        var skipFrames = 0;
        var skipFrame = false;
        var frameIdle;
        var frameStart;
        var frameEnd;
        var lastFrameTime;

        var stepStart;
        var stepEnd;
        var activeBodies;
        var passiveBodies;
        var staticBodies;

        var dynamicSpatials = [];
        var terrainBodies = {};


        PhysicsWorldAPI = function() {};

        PhysicsWorldAPI.initPhysicsWorld = function(onWorkerReady) {

            var ammoReady = function() {
                waterPhysics = new WaterPhysics();
                airPhysics = new AirPhysics();
                ammoApi.initPhysics();
                onWorkerReady();
                ShapePhysics.initData();
            };

            ammoApi = new AmmoAPI(ammoReady);
        };

        PhysicsWorldAPI.setWorldComBuffer = function(buffer) {
            comBuffer = buffer;
        };

        PhysicsWorldAPI.getWorldComBuffer = function() {
            return comBuffer;
        };

        PhysicsWorldAPI.fetchCategoryKeyData = function(category, key) {

            if (!fetches[category]) {
                fetches[category] = []
            }

            if (fetches[category].indexOf(key) === -1) {
                PhysicsWorldAPI.sendWorldMessage(ENUMS.Protocol.FETCH_PIPELINE_DATA, [category, key]);
                fetches[category].push(key);
            }
        };

        var start;

        var applyDynamicSpatials = function() {
            for (var i = 0; i < dynamicSpatials.length; i++) {
                dynamicSpatials[i].tickPhysicsUpdate(ammoApi);
            }
        };

        var isStatic;

        var updateDynamicSpatials = function(physTpf) {

            activeBodies = 0;
            passiveBodies = 0;
            staticBodies = 0;

            for (var i = 0; i < dynamicSpatials.length; i++) {
                isStatic = dynamicSpatials[i].isStatic();
                if (!isStatic) {
                //    waterPhysics.simulateDynamicSpatialInWater(dynamicSpatials[i], physTpf);
                //    airPhysics.simulateDynamicSpatialInAir(dynamicSpatials[i], physTpf);
                    dynamicSpatials[i].sampleBodyState();
                //    activeBodies += dynamicSpatials[i].getSpatialSimulateFlag();
                }

            //    passiveBodies += dynamicSpatials[i].getSpatialDisabledFlag();
                staticBodies += isStatic;
            }
        };

        var getNow = function() {
            return (performance.now() - start) / 1000
        };

        var physTpf;

        PhysicsWorldAPI.callPhysicsSimulationUpdate = function(tpF) {

            tpf = tpF;

            skipFrame = false;
            frameStart = getNow();
            frameIdle = frameStart - frameEnd;

            applyDynamicSpatials();

                physTpf = Math.min(tpf, 0.03);

                stepStart = getNow();
                ammoApi.updatePhysicsSimulation(physTpf);
                stepEnd = getNow();
                updateDynamicSpatials(physTpf);

            frameEnd = getNow();


            if (debugDraw) {
                PhysicsWorldAPI.debugDrawPhysics();
            }
        //    PhysicsWorldAPI.updatePhysicsStats();

        };

        var tempVec1 = new THREE.Vector3();
        var isSimulating;

        PhysicsWorldAPI.debugDrawPhysics = function() {
            for (var i = 0; i < dynamicSpatials.length; i++) {

                isSimulating = dynamicSpatials[i].getSpatialSimulateFlag();

                if (isSimulating) {
                    dynamicSpatials[i].getSpatialPosition(tempVec1);
                    GameAPI.debugDrawCross(tempVec1, ENUMS.Color.YELLOW, 0.3);
                }
            }
        };


        PhysicsWorldAPI.startPhysicsSimulationLoop = function() {
            start = performance.now();
            frameEnd = getNow();
        };

        var debugDraw = false;

        PhysicsWorldAPI.setDebugDrawPhysics = function(bool) {
            debugDraw = bool;
        };

        PhysicsWorldAPI.getDebugDrawPhysics = function() {
            return debugDraw;
        };

        var getTerrainKey = function(msg) {
            return ''+msg.x+'_'+msg.z;
        };

        PhysicsWorldAPI.addTerrainToPhysics = function(terrainArea) {
            console.log("Physics Worker Add Terrain:", terrainArea);

            var addTerrainToPhysics = function(terrainOpts, buffer, posX, posZ) {

                var opts = terrainOpts;
                var body = ammoApi.buildPhysicalTerrain(
                    buffer,
                    opts.terrain_size,
                    posX + opts.terrain_size / 2,
                    posZ + opts.terrain_size / 2,
                    opts.min_height,
                    opts.max_height);

                return body;
            };

            var terrainBody = addTerrainToPhysics(terrainArea.terrainOptions, terrainArea.buffers[4], terrainArea.origin.x,terrainArea.origin.z);
            terrainBodies[getTerrainKey(terrainArea.origin)] = terrainBody;
            ammoApi.includeBody(terrainBody);
            terrainArea.setAmmoBody(terrainBody);
            console.log("terrainBody:", terrainBody);
            /*
            var dynamicSpatial = new DynamicSpatial();
            dynamicSpatial.setSpatialBuffer(msg[2]);
            dynamicSpatial.setPhysicsBody(terrainBody);
            dynamicSpatials.push(dynamicSpatial);
            console.log("dynamicSpatials:", dynamicSpatials);
            */
        };


        var bodyReady = function(dynamicSpatial, rigidBody) {

            if (dynamicSpatials.indexOf(dynamicSpatial) !== -1) {
                console.log("Already registered...!")
                return;

            }

            dynamicSpatial.setPhysicsBody(rigidBody);
            dynamicSpatials.push(dynamicSpatial);
            ammoApi.includeBody(rigidBody);
        };


        var boxConfig = {
            "body_key":"box_1x1x1_crate",
             "category":"primitive",
             "state":"WANTS_DEACTIVATION",
             "shape":"Box",
             "args":[0.2, 0.2, 0.2],
             "friction":1.7,
             "restitution":0.83,
             "damping":0.15,
             "mass":20
        };

        PhysicsWorldAPI.addPhysicsToWorldEntity = function(worldEntity) {

            var dynamicSpatial = new DynamicSpatial();
            dynamicSpatial.setWorldEntity(worldEntity);

            ammoApi.setupRigidBody(boxConfig, dynamicSpatial, bodyReady);

        };

        PhysicsWorldAPI.applyForceToWorldEntity = function(worldEntity, forceVec) {

            var dynSpat = MATH.getFromArrayByKeyValue(dynamicSpatials, 'worldEntity', worldEntity);
            dynSpat.applyDynamicSpatialForce(ammoApi, forceVec);
        };


        PhysicsWorldAPI.setPhysicsGeometryBuffer = function(msg) {
            console.log("Set Phys Buffer", msg)
            ammoApi.registerGeoBuffer(msg[0], msg[1])
        };

        PhysicsWorldAPI.processRequest = function(msg) {
            protocolRequests.handleMessage(msg)
        };

        PhysicsWorldAPI.sendWorldMessage = function(protocolKey, data) {
            protocolRequests.sendMessage(protocolKey, data)
        };

        var fetchCallbacks = {};

        PhysicsWorldAPI.fetchConfigData = function(category, key, dataId, callback) {
            MainWorldAPI.fetchConfigData(category, key, dataId, callback)
        };



        PhysicsWorldAPI.applyLocalForceToBodyPoint = function(force, body, point) {
            ammoApi.applyForceAtPointToBody(force, point, body)
        };

        PhysicsWorldAPI.setBodyDamping = function(body, dampingV, dampingA) {
            ammoApi.changeBodyDamping(body, dampingV, dampingA)
        };


        PhysicsWorldAPI.waveHeightAtPos = function(pos) {
            var currentTime = PhysicsWorldAPI.getCom(ENUMS.BufferChannels.FRAME_RENDER_TIME);
            return 0.5 * (Math.sin(currentTime*0.35 + pos.x * 0.09) + Math.cos(currentTime * 0.17 + pos.z * 0.16));
        };

        var getTerrainsCount = function() {
            var count = 0;
            for (var key in terrainBodies) {
                count ++;
            }
            return count;
        };

        PhysicsWorldAPI.registerPhysError = function() {
            comBuffer[ENUMS.BufferChannels.PHYS_ERRORS]++;
        };

        PhysicsWorldAPI.getCom = function(index) {
            return comBuffer[index];
        };

        PhysicsWorldAPI.updatePhysicsStats = function() {

            comBuffer[ENUMS.BufferChannels.FRAME_IDLE] = frameIdle;

            comBuffer[ENUMS.BufferChannels.FRAME_TIME] = frameEnd - frameStart;

            if (!skipFrame) {

                comBuffer[ENUMS.BufferChannels.STEP_TIME] = stepEnd - stepStart;
            }

            comBuffer[ENUMS.BufferChannels.DYNAMIC_COUNT] = dynamicSpatials.length;
            comBuffer[ENUMS.BufferChannels.BODIES_ACTIVE] = activeBodies;
            comBuffer[ENUMS.BufferChannels.BODIES_PASSIVE] = passiveBodies;
            comBuffer[ENUMS.BufferChannels.BODIES_STATIC] = staticBodies;
            comBuffer[ENUMS.BufferChannels.BODIES_TERRAIN] = getTerrainsCount();

            comBuffer[ENUMS.BufferChannels.SKIP_FRAMES] = skipFrames;
            comBuffer[ENUMS.BufferChannels.PHYSICS_LOAD] = comBuffer[ENUMS.BufferChannels.FRAME_TIME]*1000 / comBuffer[ENUMS.BufferChannels.TPF];


        };

        return PhysicsWorldAPI;
    });

