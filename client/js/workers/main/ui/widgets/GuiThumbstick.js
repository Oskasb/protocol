"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiThumbstick = function() {
            this.pos = new THREE.Vector3();
            this.origin = new THREE.Vector3();
            this.offset = new THREE.Vector3();

            this.releaseTime = 0;
            this.releaseProgress = 0;
            this.releaseDuration = 0.25;

            this.maxRange = 0.12;

            this.activeInputIndex = null;

            var onPressStart = function(index, widget) {
                this.handleThumbstickPressStart(index, widget)
            }.bind(this);

            var onStickInputUpdate = function(input, buffer) {
                this.handleThumbstickInputUpdated(input, buffer)
            }.bind(this);

            var onStickReleasedUpdate = function(tpf, time) {
                this.handleThumbstickReleasedUpdate(tpf, time)
            }.bind(this);


            this.callbacks = {
                onPressStart:onPressStart,
                onStickInputUpdate:onStickInputUpdate,
                onStickReleasedUpdate:onStickReleasedUpdate
            }

        };


        GuiThumbstick.prototype.initThumbstick = function(widgetConfig, onReady) {


            var widgetRdy = function(widget) {
                widget.setWidgetIconKey('directional_arrows');
                widget.addOnPressStartCallback(this.callbacks.onPressStart);
                widget.enableWidgetInteraction();
                onReady(this)
            }.bind(this);

            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(null, widgetRdy);
        };


        GuiThumbstick.prototype.setOriginPosition = function(pos) {
            this.origin.copy(pos);
            this.pos.copy(this.origin);
            this.offset.set(0, 0, 0);
            this.guiWidget.setPosition(this.pos);
        };

        GuiThumbstick.prototype.applyPositionOffset = function() {
            this.guiWidget.offsetWidgetPosition(this.offset);
        };

        GuiThumbstick.prototype.handleThumbstickPressStart = function(inputIndex, guiWidget) {
            this.activeInputIndex = inputIndex;
            console.log("Thumbstick press start", inputIndex);
            GuiAPI.removeGuiUpdateCallback(this.callbacks.onStickReleasedUpdate);
            GuiAPI.addInputUpdateCallback(this.callbacks.onStickInputUpdate);

        };

        var length;

        GuiThumbstick.prototype.handleThumbstickInputUpdated = function(input, buffer) {

            var pressActive = GuiAPI.readInputBufferValue(input, buffer, ENUMS.InputState.ACTION_0);

            if (!pressActive) {
                GuiAPI.removeInputUpdateCallback(this.callbacks.onStickInputUpdate);
                GuiAPI.addGuiUpdateCallback(this.callbacks.onStickReleasedUpdate);
                this.releaseTime = 0;
            } else {
                this.offset.x = GuiAPI.readInputBufferValue(input, buffer, ENUMS.InputState.DRAG_DISTANCE_X);
                this.offset.y = GuiAPI.readInputBufferValue(input, buffer, ENUMS.InputState.DRAG_DISTANCE_Y);

                length = this.offset.length();
                if (length > this.maxRange) {
                    this.offset.normalize();
                    this.offset.multiplyScalar(this.maxRange);
                }

            }

            this.applyPositionOffset();

        };

        GuiThumbstick.prototype.handleThumbstickReleasedUpdate = function(tpf, time) {
            this.releaseTime += tpf;

            this.releaseProgress = MATH.curveSqrt(1 - MATH.calcFraction(-this.releaseDuration, this.releaseDuration, this.releaseTime-this.releaseDuration));

            this.offset.multiplyScalar(this.releaseProgress);

        //    this.offset.multiplyScalar(this.releaseProgress);

            if (this.offset.lengthSq() < 0.0000001) {
                this.offset.set(0, 0, 0);
                GuiAPI.removeGuiUpdateCallback(this.callbacks.onStickReleasedUpdate);
            }

            this.applyPositionOffset();
        };


        GuiThumbstick.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
        };


        return GuiThumbstick;

    });