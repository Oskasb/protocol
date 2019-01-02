"use strict";

define([

    ],
    function() {

        var action;
        var animKey;

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
                action.enabled = false;
                this.actionKeys.push(animMap[key]);
                this.animationActions[animMap[key]] = action;
            }
        };

        InstanceAnimator.prototype.addAnimationAction = function(actionClip) {
            return this.mixer.clipAction( actionClip );
        };

        InstanceAnimator.prototype.updateAnimationAction = function(animationKey, weight, timeScale) {
            animKey = ENUMS.getKey('Animations', animationKey);
            action = this.animationActions[animKey];

            if (!action) {
                console.log("Bad anim event")
                return;
            }

            if (weight) {
                if (!action.enabled) {
                    action.enabled = true;
                    action.play();
                }
            } else {
                if (action.enabled) {
                    action.enabled = false;
                    action.stop();
                }
            }

            action.setEffectiveTimeScale( timeScale );
            action.setEffectiveWeight( weight );
        };

        InstanceAnimator.prototype.activateAnimator = function() {
            ThreeAPI.activateMixer(this.mixer);
        };

        InstanceAnimator.prototype.deActivateAnimator = function() {
            ThreeAPI.deActivateMixer(this.mixer);
        };

        return InstanceAnimator;

    });