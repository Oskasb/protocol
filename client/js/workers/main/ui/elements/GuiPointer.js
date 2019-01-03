"use strict";

define([

    ],
    function(

    ) {

        var startIndex;
        var inputIndex;
        var inputBuffer;
        var tempVec1 = new THREE.Vector3();

        var GuiPointer = function(element) {

            this.bufferElement = element;

            var onMove = function(input, buffer) {
                inputIndex = input;

                startIndex = input * ENUMS.InputState.BUFFER_SIZE;

                inputBuffer = buffer;

                    tempVec1.x =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_X] // inputBuffer[startIndex+ ENUMS.InputState.VIEW_WIDTH] ;
                    tempVec1.y =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_Y] // inputBuffer[startIndex+ ENUMS.InputState.VIEW_HEIGHT] ;
                    tempVec1.z =  1 // (Math.random()-0.5 ) * 5 //;

                    this.setPointerPosition(tempVec1)

            }.bind(this);

            this.callbacks = {
                onMove:onMove
            }

        };


        GuiPointer.prototype.setPointerPosition = function(vec3) {
            this.bufferElement.setPositionVec3(vec3)
        };

        GuiPointer.prototype.setPointerScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        return GuiPointer;

    });