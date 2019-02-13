"use strict";

var DebugAPI;

define([
        'evt'
    ],
    function(
        evt
    ) {

        var debugDrawPhysics = false;
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
                    dynSpats[i].getSpatialPosition(tempVec1);
                    DebugAPI.debugDrawCross(tempVec1, ENUMS.Color.YELLOW, 0.3);
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

                tempVec1.copy(char.getCharacterMovement().velocity);
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

        };

        return GameAPI;
    });

