"use strict";

define([

    ],
    function(

    ) {

        var debugElements = [];

        var releaseElems = [];
        var frameDraws = 0;


        var sprite = {x:8, y:0, z:-0.015, w:-0.015};
        var scale  = {x:0.5, y:0.5, z:1.0};
        var pos  = {x:0, y:0, z:-0.999};
        var rgba = {r:1, g:1, b:1, a:1};

        var GuiDebug = function() {

        };


        GuiDebug.debugDrawPoint = function(x, y) {

            frameDraws++

            var drawPoint = function(x, y) {

                var applyElem = function(elem) {

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

                    elem.setAttackTime(0.40);
                    elem.setReleaseTime(0.01);
                    elem.startLifecycleNow();
                };

                var elemcb = function(e) {
                    //

                    applyElem(e);//
                };

                var el = releaseElems.pop();

                if (el) {
                    el.initGuiBufferElement(el.guiBuffers);
                    applyElem(el);
                } else {
                    GuiAPI.buildBufferElement("GUI_16x16", elemcb)
                }
            };

            drawPoint(x, y);
        };

        GuiDebug.updateDebugElements = function() {
            frameDraws = 0;

            while(releaseElems.length) {
                releaseElems.pop().releaseElement();
            }

            while (debugElements.length) {
                releaseElems.push(debugElements.pop())
            }

        };


        return GuiDebug;

    });