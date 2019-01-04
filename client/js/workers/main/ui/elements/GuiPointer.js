"use strict";

define([

    ],
    function(

    ) {

        var GuiPointer = function(element) {
            this.bufferElement = element;
        };


        GuiPointer.prototype.setPointerPosition = function(vec3) {
            this.bufferElement.setPositionVec3(vec3)
        };

        GuiPointer.prototype.releasePointer = function() {
            this.bufferElement.releaseElement()
        };

        GuiPointer.prototype.setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        return GuiPointer;

    });