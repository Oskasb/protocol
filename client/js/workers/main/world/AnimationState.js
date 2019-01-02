"use strict";

define([
    ],
    function() {

        var AnimationState = function(key) {
            this.key = key;
            this.weight = 0;
            this.timeScale = 1;
        };

        AnimationState.prototype.getAnimationKey = function() {
            return this.key;
        };

        AnimationState.prototype.setAnimationTimeScale = function(timeScale) {
            this.timeScale = timeScale;
        };

        AnimationState.prototype.getAnimationWeight = function() {
            return this.weight;
        };

        AnimationState.prototype.setAnimationWeight = function(weight) {
            this.weight = weight;
        };

        AnimationState.prototype.getAnimationTimeScale = function() {
            return this.timeScale;
        };

        AnimationState.prototype.setAnimationTimeScale = function(timeScale) {
            this.timeScale = timeScale;
        };

        return AnimationState;

    });