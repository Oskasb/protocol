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
        var surface;
        var intersects;

        var InputSystem = function(uiSysKey) {
            uiSysId = uiSysKey;

            this.interactiveElements = [];

            this.stupListener();
        };

        InputSystem.prototype.setAttribXY = function(name, index, x, y) {

        };

        InputSystem.prototype.updateInteractiveElements = function(inputIndex, x, y, pointer) {
            GuiAPI.debugDrawGuiPosition(x, y);

            for (var i = 0; i < this.interactiveElements.length; i++) {
                surface = this.interactiveElements[i];
                intersects = surface.testIntersection(x, y);

                if (surface.getSurfaceState() === ENUMS.ElementState.DISABLED) {
                    continue;
                }

                if (pointer) {

                    if (intersects) {

                        if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                            surface.setSurfaceState(ENUMS.ElementState.DEACTIVATE);
                            surface.surfaceOnPressStart(inputIndex);
                            continue;
                        }

                        if (surface.getSurfaceState() === ENUMS.ElementState.DEACTIVATE) {
                            continue;
                        }


                        if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE) {

                            surface.setSurfaceState(ENUMS.ElementState.DEACTIVATE);
                            surface.surfaceOnPressStart(inputIndex);

                        } else if (surface.getSurfaceState() !== ENUMS.ElementState.PRESS) {

                            surface.setSurfaceState(ENUMS.ElementState.PRESS);
                            surface.surfaceOnPressStart(inputIndex);

                        }

                    } else {

                        if (surface.getSurfaceState() === ENUMS.ElementState.DEACTIVATE) {
                            surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                            surface.surfaceOnPressActivate(inputIndex);

                        }

                    }


                } else if (intersects) {


                    if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                        continue;
                    }

                    if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE) {
                        surface.setSurfaceState(ENUMS.ElementState.ACTIVE_HOVER);
                        surface.surfaceOnHover(inputIndex);
                        continue;
                    }

                    if (surface.getSurfaceState() === ENUMS.ElementState.PRESS) {

                        surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                        surface.surfaceOnPressActivate(inputIndex);

                    } else if (surface.getSurfaceState() !== ENUMS.ElementState.HOVER) {
                        surface.setSurfaceState(ENUMS.ElementState.HOVER);
                        surface.surfaceOnHover(inputIndex);
                    }

                } else {

                    if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE) {
                        continue;
                    }

                    if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                        surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                        continue;
                    }

                    if (surface.getSurfaceState() !== ENUMS.ElementState.NONE) {
                        surface.setSurfaceState(ENUMS.ElementState.NONE);
                        surface.surfaceOnHoverEnd(inputIndex);

                    }
                }
            }

        };



        InputSystem.prototype.stupListener = function() {

            var sampleInput = function(input, buffer) {
                inputIndex = input;

                startIndex = input * ENUMS.InputState.BUFFER_SIZE;

                inputBuffer = buffer;

                pointer = null;

                if (inputBuffer[startIndex + ENUMS.InputState.ACTION_0]) {

                    tempVec1.x =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_X] //+ inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_X] ;
                    tempVec1.y =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_Y] //+ inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_Y] ;
                    tempVec1.z = -1 // (Math.random()-0.5 ) * 5 //;

                    if (!pointers[inputIndex]) {

                        var addPointer = function(bufferElem) {
                            pointer = new GuiPointer(bufferElem);
                            pointer.setPointerPosition(tempVec1);
                            pointers[inputIndex] = pointer;
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
                        pointer = null;
                        pointers[inputIndex] = null;
                    }

                }

                if (inputBuffer[startIndex+ ENUMS.InputState.HAS_UPDATE]) {
                    this.updateInteractiveElements(inputIndex, inputBuffer[startIndex+ ENUMS.InputState.MOUSE_X], inputBuffer[startIndex+ ENUMS.InputState.MOUSE_Y], pointer)
                }


            }.bind(this);

            GuiAPI.addInputUpdateCallback(sampleInput);
        };

        InputSystem.prototype.registerInteractiveSurfaceElement = function(surfaceElement) {
            this.interactiveElements.push(surfaceElement);
        };

        InputSystem.prototype.unregisterInteractiveSurfaceElement = function(surfaceElement) {
            this.interactiveElements.splice(this.interactiveElements.indexOf(surfaceElement), 1);
        };

        InputSystem.prototype.setAttribXYZ = function(name, index, x, y, z) {

        };

        InputSystem.prototype.setAttribXYZW = function(name, index, x, y, z, w) {

        };

        return InputSystem;

    });