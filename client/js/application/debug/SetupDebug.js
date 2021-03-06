"use strict";


define([
    'application/debug/lines/LineRenderSystem',
    'evt'
], function(
    LineRenderSystem,
    evt
) {

    var lineDenderSystem;
    var tempVec1 = new THREE.Vector3();
    var tempVec2 = new THREE.Vector3();
    var color;

    var SetupDebug = function() {
        lineDenderSystem = new LineRenderSystem();

        var drawLine = function(args) {
            tempVec1.set(args[0], args[1], args[2]);
            tempVec2.set(args[3], args[4], args[5]);
            color = lineDenderSystem.color(ENUMS.getKey('Color', args[6]));
            lineDenderSystem.drawLine(tempVec1, tempVec2, color)
        };

        var drawCross = function(args) {
            tempVec1.set(args[0], args[1], args[2]);
            color = lineDenderSystem.color(ENUMS.getKey('Color', args[3]));
            lineDenderSystem.drawCross(tempVec1, color, args[4])
        };

        var drawBox = function(args) {
            tempVec1.set(args[0], args[1], args[2]);
            tempVec2.set(args[3], args[4], args[5]);
            color = lineDenderSystem.color(ENUMS.getKey('Color', args[6]));
            lineDenderSystem.drawAABox(tempVec1, tempVec2, color)
        };

        evt.on(ENUMS.Event.DEBUG_DRAW_LINE, drawLine);
        evt.on(ENUMS.Event.DEBUG_DRAW_CROSS, drawCross);
        evt.on(ENUMS.Event.DEBUG_DRAW_AABOX, drawBox);

    };

    SetupDebug.prototype.updateSetupDebug = function() {
        lineDenderSystem.render();
    };




    return SetupDebug;

});