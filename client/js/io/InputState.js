"use strict";

define([
        'io/ElementListeners'
    ],
    function(
        ElementListeners
    ) {

    var pointerState = function(index) {
        this.index = index;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.wheelDelta = 0;
        this.startDrag = [0, 0];
        this.dragDistance = [0, 0];
        this.action = [0, 0];
        this.lastAction = [0, 0];
        this.pressFrames = 0
    };

        var POINTER_STATE = {};

        var InputState = function() {

            var index = 0;

            POINTER_STATE.mouse = new pointerState(index);
            POINTER_STATE.touches = [];

            for (var i = 0; i < ENUMS.Numbers.TOUCHES_COUNT; i++) {
                index++;
                POINTER_STATE.touches[i] = new pointerState(index)
            }

            this.elementListeners = new ElementListeners(POINTER_STATE);
        };



        InputState.prototype.setupUpdateCallback = function(cb) {
            this.elementListeners.attachUpdateCallback(cb);
        };

        InputState.prototype.getPointerState = function() {
            return POINTER_STATE;
        };

        InputState.prototype.processDragState = function(inputState) {
            inputState.dragDistance[0] = inputState.startDrag[0] - inputState.x;
            inputState.dragDistance[1] = inputState.startDrag[1] - inputState.y;
        };

        InputState.prototype.updateInputState = function(inputState) {
            inputState.lastAction[0] = inputState.action[0];
            inputState.lastAction[1] = inputState.action[1];

            this.elementListeners.sampleMouseState(inputState);

            if (inputState.lastAction[0] !== inputState.action[0]) {

                if (inputState.action[0] + inputState.action[1]) {
                    this.mouseButtonEmployed(inputState);
            //        evt.fire(evt.list().CURSOR_PRESS, this.inputState);
                } else {
                    if (inputState.pressingButton) {
            //            evt.fire(evt.list().CURSOR_RELEASE, this.inputState);
                    }
                }
            }

            if (inputState.lastAction[1] !== inputState.action[1]) {
                if (inputState.action[1]) {
                    inputState.pressingButton = 1;
                } else {
                    if (inputState.pressingButton) {
                        inputState.pressingButton = 0;
                    }
                }
            }

            if (inputState.action[0] + inputState.action[1]) {
                this.processDragState(inputState);
            }
        };

        InputState.prototype.mouseButtonEmployed = function(inputState) {

            if (inputState.action[0]) {
                this.handleLeftButtonPress(inputState);
            }
        };

        InputState.prototype.handleLeftButtonPress = function(inputState) {
            if (!inputState.pressingButton) {
                inputState.startDrag[0] = inputState.x;
                inputState.startDrag[1] = inputState.y;
            }

            inputState.pressingButton = 1;
        };

        return InputState;

    });