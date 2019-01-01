"use strict";

define([

    ],
    function() {

    var action;

        var InstanceAnimator = function(instancedModel) {
            this.animationActions = {};
            this.instancedModel = instancedModel;
            this.addMixer(this.instancedModel.getObj3d());
            this.setupAnimations(this.instancedModel.getAnimationMap())
        };

        InstanceAnimator.prototype.addMixer = function(clone) {
            this.mixer = new THREE.AnimationMixer( clone );
        };

        InstanceAnimator.prototype.setupAnimations = function(animMap) {

            this.actionKeys = [];

            for (var key in animMap) {
                var actionClip = this.instancedModel.originalModel.getAnimationClip(animMap[key]);
                var action = this.addAnimationAction(actionClip);
                this.actionKeys.push(animMap[key]);
                this.animationActions[animMap[key]] = action;
            }
        };

        InstanceAnimator.prototype.addAnimationAction = function(actionClip) {
            return this.mixer.clipAction( actionClip );
        };

        InstanceAnimator.prototype.playAnimationAction = function(animationKey, timeScale, weight) {
            action = this.animationActions[animationKey]
            action.play();
            action.setEffectiveTimeScale( timeScale );
            action.setEffectiveWeight( weight );
        };

        return InstanceAnimator;

    });