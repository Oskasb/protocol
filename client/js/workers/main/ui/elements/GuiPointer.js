"use strict";

define([

    ],
    function(

    ) {

        var GuiPointer = function(element) {
            this.bufferElement = element;
            this.pointerState = null;
            this.activeElement = null;
            this.targetElementState = null;
            this.inputIndex = null;
        };

        GuiPointer.prototype.setPointerActiveElement = function(activeElement) {

            if (this.activeElement !== activeElement) {
            //    GuiAPI.printDebugText("CHANGE POINTER TARGET");
                this.activeElement = activeElement;
                return true;
            }

        };

        GuiPointer.prototype.updateTargetElementState = function(elementState) {

            if (this.targetElementState !== elementState) {

                GuiAPI.printDebugText("ELEMENT STATE:", ENUMS.getKey('ElementState', elementState));

                this.targetElementState = elementState;
                return true;
            }

        };

        GuiPointer.prototype.setInputIndex = function(inputIndex) {
            this.inputIndex = inputIndex;
        };

        GuiPointer.prototype.getInputIndex = function() {
            return this.inputIndex;
        };

        GuiPointer.prototype.updatePointerState = function(element) {
            return this.activeElement === element;
        };


        GuiPointer.prototype.elementMatchesCurrentTarget = function(element) {
            return this.activeElement === element;
        };

        GuiPointer.prototype.pointerMathesState = function(state) {
            return this.pointerState === state;
        };


        GuiPointer.prototype.setPointerPosition = function(vec3) {
            this.bufferElement.setPositionVec3(vec3)
        };

        GuiPointer.prototype.releasePointer = function() {
        //    GuiAPI.printDebugText("RELEASE POINTER");
            this.bufferElement.releaseElement()
        };



        GuiPointer.prototype.setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        return GuiPointer;

    });