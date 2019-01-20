"use strict";

define([
    ],
    function() {

        var AnimationState = function(key, dirtyCallback) {
            this.key = key;
            this.weight = 0;
            this.targetWeight = 0;
            this.timeScale = 1;
            this.fade = 0.25;
            this.playing = true;

            this.isDirty = true;

            var notifyUpdated = function() {
                this.isDirty = true;
                dirtyCallback();
            }.bind(this);

            this.callbacks = {
                notifyUpdated:notifyUpdated
            }

        };

        AnimationState.prototype.getAnimationStatePlaying = function() {
            return this.playing;
        };

        AnimationState.prototype.animationStatePlay = function(bool) {
            this.playing = bool;
            if (bool) {
                this.weight = this.targetWeight;
            } else {
                this.weight = 0;
            }
            this.callbacks.notifyUpdated()
        };

        AnimationState.prototype.getAnimationKey = function() {
            return this.key;
        };

        AnimationState.prototype.setAnimationFade = function(fade) {
            this.fade = fade;
            this.callbacks.notifyUpdated()
        };

        AnimationState.prototype.getAnimationFade = function() {
            return this.fade;
        };

        AnimationState.prototype.setAnimationTimeScale = function(timeScale) {
            this.timeScale = timeScale;
            this.callbacks.notifyUpdated()
        };

        AnimationState.prototype.getAnimationWeight = function() {
            return this.weight;
        };

        AnimationState.prototype.setAnimationWeight = function(weight) {
            if (this.targetWeight === weight) return;
            this.targetWeight = weight;
            this.weight = weight;
            this.callbacks.notifyUpdated()
        };

        AnimationState.prototype.getAnimationTimeScale = function() {
            return this.timeScale;
        };

        AnimationState.prototype.setAnimationTimeScale = function(timeScale) {
            this.timeScale = timeScale;
            this.callbacks.notifyUpdated()
        };

        return AnimationState;

    });