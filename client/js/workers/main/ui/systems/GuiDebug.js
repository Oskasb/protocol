"use strict";

define([

    ],
    function(

    ) {

        var debugElements = [];

        var releaseElems = [];
        var frameDraws = 0;

        var sprite = {x:8, y:0, z:0.025, w:0.025};
        var scale  = {x:0.2, y:0.2, z:1.0};
        var pos  = {x:0, y:0, z:-0.999};
        var rgba = {r:1, g:1, b:1, a:1};


        var debugTxtPos = new THREE.Vector3();

        var GuiDebug = function() {

        };


        var applyElem = function(elem, x, y) {

            debugElements.push(elem);

            elem.setSprite(sprite);
            elem.setScaleVec3(scale);

            rgba.r = Math.sin(elem.index*0.2152)*0.25+0.75;
            rgba.g = Math.cos(elem.index*0.3315)*0.25+0.75;

            rgba.b = Math.random()*0.75+0.25;

            elem.setColorRGBA(rgba);

            pos.x = x;
            pos.y = y;

            elem.setPositionVec3(pos);

            elem.setAttackTime(0.0);
            elem.setReleaseTime(0.2);
            elem.startLifecycleNow();

        };


        var reqElem = function(xx, yy) {

            var elemcb = function(e) {
                applyElem(e, xx, yy);
            };

            GuiAPI.buildBufferElement("GUI_16x16", elemcb)
        };


        var drawPointXY = function(x, y) {
            frameDraws++;
            reqElem(x, y);
        };


        GuiDebug.debugDrawPoint = function(x, y) {
            drawPointXY(x, y);
        };

        GuiDebug.drawRectExtents = function(minVec, maxVec) {
            drawPointXY(minVec.x, minVec.y);
            drawPointXY(maxVec.x, minVec.y);
            drawPointXY(minVec.x, maxVec.y);
            drawPointXY(maxVec.x, maxVec.y);
        };



        GuiDebug.addDebugTextString = function(string) {
            if (!debugText) return;
            debugText.drawTextString('FONT_16x16',string, 7 )
        };

        var debugText;


        GuiDebug.addDebugTextPanel = function(configId, pos) {

            var addTextCB = function(element) {
                debugText = element;

                var surfaceReady = function() {
                    GuiAPI.getTextSystem().addTextElement( debugText );
                };

                debugText.setupTextSurface("debug_text_box", surfaceReady)

            };

            GuiAPI.getTextSystem().buildTextElement(addTextCB, configId, pos)
        };


        GuiDebug.updateDebugElements = function() {
            frameDraws = 0;

            while (debugElements.length) {
                debugElements.pop().releaseElement();
            }

        };

        return GuiDebug;

    });