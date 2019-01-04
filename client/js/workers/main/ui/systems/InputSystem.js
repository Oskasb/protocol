"use strict";

define([
        'client/js/workers/main/ui/elements/GuiPointer'
    ],
    function(
        GuiPointer
    ) {

        var startIndex;

        var inputIndex;
        var inputBuffer;
        var tempVec1 = new THREE.Vector3();

        var pointers = [];
        var pointerBuffer = []
        var pointer;

        var uiSysId;

        var InputSystem = function(uiSysKey) {
            uiSysId = uiSysKey;
            this.stupListener()
        };

        InputSystem.prototype.setAttribXY = function(name, index, x, y) {

        };



        var sampleInput = function(input, buffer) {
            inputIndex = input;

            startIndex = input * ENUMS.InputState.BUFFER_SIZE;

            inputBuffer = buffer;

            if (inputBuffer[startIndex + ENUMS.InputState.ACTION_0]) {

                tempVec1.x =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_X] //+ inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_X] ;
                tempVec1.y =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_Y] //+ inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_Y] ;
                tempVec1.z = -1 // (Math.random()-0.5 ) * 5 //;

                if (!pointers[inputIndex]) {

                    var addPointer = function(bufferElem) {
                        pointers[inputIndex] = new GuiPointer(bufferElem);
                    };
                    pointers[inputIndex] = true;
                    GuiAPI.buildBufferElement(uiSysId, addPointer)

                } else {

                    pointer = pointers[inputIndex];
                    pointer.setPointerPosition(tempVec1)

                }

            } else {

                if (pointers[inputIndex]) {
                    pointer = pointers[inputIndex];
                    pointer.releasePointer();
                    pointers[inputIndex] = null;
                }

            }

        };


        InputSystem.prototype.stupListener = function() {
            GuiAPI.addInputUpdateCallback(sampleInput);
        };

        InputSystem.prototype.setAttribXY = function(name, index, x, y) {

        };

        InputSystem.prototype.setAttribXYZ = function(name, index, x, y, z) {

        };

        InputSystem.prototype.setAttribXYZW = function(name, index, x, y, z, w) {

        };

        return InputSystem;

    });