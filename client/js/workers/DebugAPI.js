"use strict";

var DebugAPI;

define([
        'evt'
    ],
    function(
        evt
    ) {

        var debugDrawPhysics = false;
        var debugDrawJoints = false;
        var debugDrawChars = false;
        var tempObj3d = new THREE.Object3D();

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();
        var isSimulating;

        DebugAPI = function() {};


        var dynSpats;

        DebugAPI.debugDrawPhysics = function() {
            dynSpats = PhysicsWorldAPI.getDynamicSpatials();
            for (var i = 0; i < dynSpats.length; i++) {

                isSimulating = dynSpats[i].getSpatialSimulateFlag();

                if (isSimulating) {
                    let args = dynSpats[i].getConfigKey('args');
                    dynSpats[i].getSpatialPosition(tempVec1);
                    DebugAPI.debugDrawCross(tempVec1, ENUMS.Color.YELLOW, args[0]);
                    tempVec2.copy(dynSpats[i].up);
                    tempVec2.multiplyScalar(args[0]);
                    tempVec2.add(tempVec1);
                    DebugAPI.debugDrawLine(tempVec2, tempVec1, ENUMS.Color.ORANGE);

                    tempVec2.copy(dynSpats[i].axis);
                    tempVec2.add(tempVec1);
                    DebugAPI.debugDrawLine(tempVec2, tempVec1, ENUMS.Color.CYAN)

                }
            }
        };

        DebugAPI.setDebugDrawPhysics = function(bool) {
            debugDrawPhysics = bool;
        };

        DebugAPI.getDebugDrawPhysics = function() {
            return debugDrawPhysics;
        };


        DebugAPI.debugDrawCharacters = function() {

            let characters = GameAPI.getGameMain().getCharacters();

            for (var i = 0; i < characters.length; i++) {
                let char = characters[i];

                tempVec1.copy(char.getCharacterMovement().inputVector);
                char.getCharacterPosition(tempVec2);
                if (tempVec1.lengthSq()) {

                    tempVec1.add(tempVec2);

                    DebugAPI.debugDrawLine(tempVec2, tempVec1, ENUMS.Color.ORANGE);
                } else {
                    DebugAPI.debugDrawCross(tempVec2, ENUMS.Color.AQUA, 0.25);
                }


            }
        };


        DebugAPI.setDebugDrawCharacters = function(bool) {
            debugDrawChars = bool;
        };

        DebugAPI.getDebugDrawCharacters = function() {
            return debugDrawChars;
        };



        var drawJoints = function(joints) {

            for (var i = 0; i < joints.length; i++) {
                joints[i].getDynamicPosition(tempVec1);
                DebugAPI.debugDrawCross(tempVec1, ENUMS.Color.GREEN, 0.1);
            }
        };


        DebugAPI.debugDrawJoints = function() {

            let piece = GameAPI.getGameMain().getPieces();

            for (var i = 0; i < piece.length; i++) {
                let worldEntity = piece[i].getWorldEntity();
                drawJoints(worldEntity.attachmentJoints);
            }
        };

        DebugAPI.setDebugDrawJoints = function(bool) {
            debugDrawJoints = bool;
        };

        DebugAPI.getDebugDrawJoints = function() {
            return debugDrawJoints;
        };

        DebugAPI.debugDrawRaycast = function(fromVec, dirVec, hitPosStore, hitNormStore) {
            tempVec1.copy(dirVec);
            tempVec1.add(fromVec);
            DebugAPI.debugDrawLine(fromVec, tempVec1, ENUMS.Color.PINK);
            if (hitPosStore) {
                DebugAPI.debugDrawCross(hitPosStore, ENUMS.Color.MAGENTA, 0.08);
                tempVec1.copy(hitNormStore);
                tempVec1.add(hitPosStore);
                DebugAPI.debugDrawLine(hitPosStore, tempVec1, ENUMS.Color.PEA);
            }

        };

        var largs = [];
        DebugAPI.debugDrawLine = function(fromVec3, toVec3, color) {
            largs[0] = fromVec3.x;
            largs[1] = fromVec3.y;
            largs[2] = fromVec3.z;
            largs[3] = toVec3.x;
            largs[4] = toVec3.y;
            largs[5] = toVec3.z;
            largs[6] = color;
            evt.fire(ENUMS.Event.DEBUG_DRAW_LINE, largs)
        };

        var xargs = [];
        DebugAPI.debugDrawCross = function(point, color, size) {
            xargs[0] = point.x;
            xargs[1] = point.y;
            xargs[2] = point.z;
            xargs[3] = color;
            xargs[4] = size;
            evt.fire(ENUMS.Event.DEBUG_DRAW_CROSS, xargs)
        };

        var bargs = [];
        DebugAPI.debugDrawAABox = function(fromVec3, toVec3, color) {
            bargs[0] = fromVec3.x;
            bargs[1] = fromVec3.y;
            bargs[2] = fromVec3.z;
            bargs[3] = toVec3.x;
            bargs[4] = toVec3.y;
            bargs[5] = toVec3.z;
            bargs[6] = color;
            evt.fire(ENUMS.Event.DEBUG_DRAW_AABOX, bargs)
        };

        DebugAPI.updateDebugApi = function() {

            if (debugDrawPhysics) {
                DebugAPI.debugDrawPhysics();
            }

            if (debugDrawChars) {
                DebugAPI.debugDrawCharacters();
            }

            if (debugDrawJoints) {
                DebugAPI.debugDrawJoints();
            }

        };

        return GameAPI;
    });

