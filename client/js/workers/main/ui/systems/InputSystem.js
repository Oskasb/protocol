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

        var pointer;

        var uiSysId;
        var surface;
        var intersects;

        var InputSystem = function() {

            this.surfaceElements = [];
            this.stupListener();

        };


        InputSystem.prototype.initInputSystem = function(callback) {

            var onInputSetting = function(src, data) {

                uiSysId = src;
                GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
                callback();
            };

            var backplates = function(src, data) {
                GuiAPI.addUiSystem(src, data.config["sprite_atlas"],  data.config["mesh_asset"],   data.config["pool_size"], data.config["render_order"]);
                GuiAPI.getGuiSettings().initGuiSettings(["UI_ELEMENTS_MAIN"], onInputSetting);
            };

            GuiAPI.getGuiSettings().initGuiSettings(["UI_ELEMENTS_BACK"], backplates);

        };


        InputSystem.prototype.getIntersectingElement = function(x, y, inputIndex) {
            for (var i = 0; i < this.surfaceElements.length; i++) {
                surface = this.surfaceElements[i];

                intersects = surface.testIntersection(x, y);

                interactiveElem = surface.getInteractiveElement();

                if (intersects) {
                    return interactiveElem;
                } else {
                    interactiveElem.notifyInputOutside(inputIndex)
                }
            }
        };

        var interactiveElem;

        InputSystem.prototype.updateInteractiveElements = function(inputIndex, x, y, pointer) {

            GuiAPI.debugDrawGuiPosition(x, y);

            if (pointer) {

                if (pointer.getPointerInteractiveElement()) {
                    pointer.updatePointerInteractiveElement();
                    return;
                }

                interactiveElem = this.getIntersectingElement(x, y, inputIndex);

                if (interactiveElem) {
                    pointer.pointerPressElementStart(interactiveElem);
                } else {
                    pointer.setIsSeeking(false);
                }

            } else {

                interactiveElem = this.getIntersectingElement(x, y, inputIndex);

                if (interactiveElem) {
                    interactiveElem.notifyHoverStateOn(inputIndex);
                }
            }

        };



        InputSystem.prototype.stupListener = function() {

            var sampleInput = function(input, buffer) {
                inputIndex = input;

                startIndex = input * ENUMS.InputState.BUFFER_SIZE;

                inputBuffer = buffer;

                if (inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] === 3) {
                    inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE] = 0;
                }

                pointer = null;

                if (inputBuffer[startIndex + ENUMS.InputState.ACTION_0]) {

                    tempVec1.x =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_X] //+ inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_X] ;
                    tempVec1.y =  inputBuffer[startIndex+ ENUMS.InputState.MOUSE_Y] //+ inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_Y] ;
                    tempVec1.z = 0 // (Math.random()-0.5 ) * 5 //;

                    if (!pointers[inputIndex]) {

                        var addPointer = function(bufferElem) {
                            pointer = new GuiPointer(bufferElem);
                            pointer.setPointerPosition(tempVec1);
                            pointer.setIsSeeking(true);
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

                if (inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE]) {
                    inputBuffer[startIndex + ENUMS.InputState.HAS_UPDATE]++;
                    this.updateInteractiveElements(inputIndex, inputBuffer[startIndex+ ENUMS.InputState.MOUSE_X], inputBuffer[startIndex+ ENUMS.InputState.MOUSE_Y], pointer)
                }

            }.bind(this);

            GuiAPI.addInputUpdateCallback(sampleInput);
        };

        InputSystem.prototype.registerInteractiveSurfaceElement = function(surfaceElement) {
            this.surfaceElements.push(surfaceElement);
        };

        InputSystem.prototype.unregisterInteractiveSurfaceElement = function(surfaceElement) {
            this.surfaceElements.splice(this.surfaceElements.indexOf(surfaceElement), 1);
        };

        InputSystem.prototype.setAttribXYZ = function(name, index, x, y, z) {

        };

        InputSystem.prototype.setAttribXYZW = function(name, index, x, y, z, w) {

        };

        return InputSystem;

    });