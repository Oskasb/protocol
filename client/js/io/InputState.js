"use strict";

define([
        'io/ElementListeners'
    ],
    function(
        ElementListeners
    ) {

    var POINTER_STATE = {};

        var InputState = function() {

            POINTER_STATE.line = {
                up:0,
                fromX:0,
                fromY:0,
                toX:0,
                toY:0,
                w: 0,
                zrot:0
            };

            POINTER_STATE.inputState = {
                x:0,
                y:0,
                dx:0,
                dy:0,
                wheelDelta:0,
                startDrag:[0, 0],
                dragDistance:[0, 0],
                action:[0, 0],
                lastAction:[0, 0],
                pressFrames:0
            };

            this.line = POINTER_STATE.line;
            this.inputState = POINTER_STATE.inputState;

            this.elementListeners = new ElementListeners(POINTER_STATE.inputState);
        };

        var minLine = 5;

        InputState.prototype.setLine = function(x1, y1, x2, y2, distance, zrot) {
            this.line.up = y2-y1;
            this.line.fromX = x1;
            this.line.fromY=y1;
            this.line.toX = x2;
            this.line.toY = y2;
            this.line.w = distance+0.4;
            if (this.line.w < minLine) zrot = 0.00001;
            this.line.zrot = zrot;
        };

        InputState.prototype.getLine = function() {
            return this.line;
        };

        InputState.prototype.setupUpdateCallback = function(cb) {
            this.elementListeners.attachUpdateCallback(cb);
        };

        InputState.prototype.getPointerState = function() {
            return POINTER_STATE;
        };

        InputState.prototype.processDragState = function() {

            this.inputState.dragDistance[0] = this.inputState.startDrag[0] - this.inputState.x;
            this.inputState.dragDistance[1] = this.inputState.startDrag[1] - this.inputState.y;
        };

        InputState.prototype.updateInputState = function() {
            this.inputState.lastAction[0] = this.inputState.action[0];
            this.inputState.lastAction[1] = this.inputState.action[1];

            this.elementListeners.sampleMouseState(this.inputState);

            if (this.inputState.lastAction[0] !== this.inputState.action[0]) {

                if (this.inputState.action[0] + this.inputState.action[1]) {
                    this.mouseButtonEmployed();
            //        evt.fire(evt.list().CURSOR_PRESS, this.inputState);
                } else {
                    if (this.inputState.pressingButton) {
            //            evt.fire(evt.list().CURSOR_RELEASE, this.inputState);
                    }
                }
            }

            if (this.inputState.lastAction[1] !== this.inputState.action[1]) {
                if (this.inputState.action[1]) {
                    this.inputState.pressingButton = 1;
                } else {
                    if (this.inputState.pressingButton) {
                        this.inputState.pressingButton = 0;
                    }
                }
            }

            if (this.inputState.action[0] + this.inputState.action[1]) {
                this.processDragState();
            }
        };

        InputState.prototype.mouseButtonEmployed = function() {

            if (this.inputState.action[0]) {
                this.handleLeftButtonPress();
            }
        };

        InputState.prototype.handleLeftButtonPress = function() {
            if (!this.inputState.pressingButton) {
                this.inputState.startDrag[0] = this.inputState.x;
                this.inputState.startDrag[1] = this.inputState.y;
            }

            this.inputState.pressingButton = 1;
        };

        return InputState;

    });