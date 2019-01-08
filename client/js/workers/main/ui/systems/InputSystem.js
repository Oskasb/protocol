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


        InputSystem.prototype.updatePointerSurfaceIntersecting = function(pointer, surface) {

            if (surface.getSurfaceState() === ENUMS.ElementState.PRESS) {
                return;
            }

            if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_PRESS) {
                return;
            }

            if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE_PRESS);
                surface.surfaceOnPressStart();
                return;
            }

            if (surface.getSurfaceState() === ENUMS.ElementState.HOVER) {
                surface.setSurfaceState(ENUMS.ElementState.PRESS);
                surface.surfaceOnPressStart();
            }

        };

        InputSystem.prototype.updatePointerSurfaceExit = function(pointer, surface) {

            surface.setActiveInputIndex(null);

            if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                surface.surfaceOnHoverEnd();
                return;
            }

            if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_PRESS) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                surface.surfaceOnPressEnd();
                return;
            }

            if (surface.getSurfaceState() === ENUMS.ElementState.HOVER) {
                //    surface.setSurfaceState(ENUMS.ElementState.NONE);
                //    surface.surfaceOnHoverEnd();
                return;
            }


            if (surface.getSurfaceState() === ENUMS.ElementState.PRESS) {
                //    surface.setSurfaceState(ENUMS.ElementState.NONE);
                //    surface.surfaceOnPressEnd();
                return;
            }

            if (surface.getSurfaceState() !== ENUMS.ElementState.PRESS) {
                //    surface.setSurfaceState(ENUMS.ElementState.PRESS);
                //    surface.surfaceOnPressEnd();
            }
        };


        InputSystem.prototype.updatePointerSurfaceStatus = function(pointer, surface, intersects) {

            if (intersects) {

                this.updatePointerSurfaceIntersecting(pointer, surface);

            } else {

                if (pointer.activeElement) {

                    pointer.setPointerActiveElement(null)
                    this.updatePointerSurfaceExit(pointer, surface);

                }

            }

        };

        InputSystem.prototype.updateHoverStart = function(surface, intersects) {



            if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                return;
            }
            //

            if (intersects) {
                if (surface.getSurfaceState() === ENUMS.ElementState.NONE) {
                    surface.setSurfaceState(ENUMS.ElementState.HOVER);
                    surface.surfaceOnHover();
                    return;
                }

                if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE) {
                    surface.setSurfaceState(ENUMS.ElementState.ACTIVE_HOVER);
                    surface.surfaceOnHover();
                    return;
                }
            }

            if (surface.getSurfaceState() !== ENUMS.ElementState.NONE) {
                surface.setSurfaceState(ENUMS.ElementState.NONE);
                surface.surfaceOnHoverEnd();
            }

        };


        InputSystem.prototype.updateHoverEnd = function(surface) {

            if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_HOVER) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                GuiAPI.printDebugText("5 "+surface.getSurfaceState());
                return;
            }

            if (surface.getSurfaceState() !== ENUMS.ElementState.NONE) {
                surface.setSurfaceState(ENUMS.ElementState.NONE);
                surface.surfaceOnHoverEnd();
            }

        };

        InputSystem.prototype.startPointerIntersectSurface = function(pointer, surface, intersects) {

        };

        InputSystem.prototype.endActiveSurfaceInput = function(pointer, surface) {


            surface.activeInputIndex = null;

            if (surface.getSurfaceState() === (ENUMS.ElementState.ACTIVE)) {
                surface.setSurfaceState(ENUMS.ElementState.NONE);
                surface.surfaceOnPressDeactivate();
                return;
            }

            if (surface.getSurfaceState() === (ENUMS.ElementState.PRESS)) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                surface.surfaceOnPressActivate();
                return;
            }

            if (surface.getSurfaceState() === (ENUMS.ElementState.PRESS)) {
                surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                surface.surfaceOnPressActivate();
                return;
            }


            GuiAPI.printDebugText("3 "+surface.getSurfaceState());


        };

        InputSystem.prototype.updateInputActiveOnSurface = function(pointer, surface, inputIndex) {


            if (pointer) {

                if (surface.getSurfaceState() === (ENUMS.ElementState.HOVER || ENUMS.ElementState.NONE)) {
                    surface.setSurfaceState(ENUMS.ElementState.PRESS);
                    surface.surfaceOnPressStart(pointer.getInputIndex());
                    return;
                }

                if (surface.getSurfaceState() === (ENUMS.ElementState.ACTIVE || ENUMS.ElementState.ACTIVE_HOVER)) {
                    surface.setSurfaceState(ENUMS.ElementState.ACTIVE_PRESS);
                    surface.surfaceOnPressStart(pointer.getInputIndex());
                    return;
                }

                GuiAPI.printDebugText("2 "+surface.getSurfaceState());

            } else {

                if (surface.getSurfaceState() === ENUMS.ElementState.PRESS) {
                    surface.setSurfaceState(ENUMS.ElementState.ACTIVE);
                    surface.surfaceOnPressActivate();
                    return;
                }

                if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE_PRESS) {
                    surface.setSurfaceState(ENUMS.ElementState.NONE);
                    surface.surfaceOnPressActivate();
                    return;
                }

                if (surface.getSurfaceState() === ENUMS.ElementState.NONE) {
                    surface.setSurfaceState(ENUMS.ElementState.HOVER);
                    surface.surfaceOnHover();
                    return;
                }

                if (surface.getSurfaceState() === ENUMS.ElementState.ACTIVE) {
                    surface.setSurfaceState(ENUMS.ElementState.ACTIVE_HOVER);
                    surface.surfaceOnHover();
                    return;
                }

                if (surface.getSurfaceState() === ENUMS.ElementState.HOVER) {
                    GuiAPI.printDebugText("0"+surface.getSurfaceState());
                    return;
                }

                GuiAPI.printDebugText("1"+surface.getSurfaceState());
            }



        };


        InputSystem.prototype.updateInputAgainstSurface = function(inputIndex, pointer, surface, intersects) {
            var currentSurfaceInput = surface.getActiveInputIndex();

            if (typeof(currentSurfaceInput) === 'number') {

                if (currentSurfaceInput === inputIndex) {

                    if (intersects) {
                        this.updateInputActiveOnSurface(pointer, surface, inputIndex);
                    } else {
                        this.endActiveSurfaceInput(pointer, surface);
                    }
                }

                return;
            }

            surface.activeInputIndex = null;

            if (intersects) {

                if (pointer) {
                    this.startPointerIntersectSurface(pointer, surface, intersects)
                } else {
                    surface.surfaceOnHover(inputIndex);
                }

            } else {
                surface.setActiveInputIndex(false);
                this.updateHoverEnd(surface)
            }

        };



        InputSystem.prototype.updateInteractiveElements = function(inputIndex, x, y, pointer) {
            GuiAPI.debugDrawGuiPosition(x, y);

            for (var i = 0; i < this.interactiveElements.length; i++) {
                surface = this.interactiveElements[i];
                intersects = surface.testIntersection(x, y);

                if (surface.getSurfaceState() === ENUMS.ElementState.DISABLED) {
                    continue;
                }

                this.updateInputAgainstSurface(inputIndex, pointer, surface, intersects)

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
                        pointer.setInputIndex(inputIndex);
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