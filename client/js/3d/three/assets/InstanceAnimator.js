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

        InstanceAnimator.prototype.updateAnimationAction = function(animationKey, weight, timeScale, fade) {
            animKey = ENUMS.getKey('Animations', animationKey);
            action = this.animationActions[animKey];

            if (!action) {
                console.log("Bad anim event")
                return;
            }

            action.setEffectiveTimeScale( timeScale );

            if (weight) {


            //    action.weight = weight;

                if (!action.on) {
                    action.setEffectiveWeight( weight );
                //    action.stop();
                    action.on = true;
                    action.play();
                    if (fade) {
                        action.fadeIn(fade);
                    }
                } else {

                    if (fade) {
                        console.log("_sched fade")
                        action._scheduleFading(fade, 1, weight / action.getEffectiveWeight())
                        // action.fadeIn(fade);
                    }
                }


            } else {
                if (fade) {
                    action.fadeOut(fade);
                } else if (action.on) {
                    action.on = false;
                    action.stop();
                }
            }

            //   action.setEffectiveWeight( weight );
        };

        InstanceAnimator.prototype.activateAnimator = function() {
            ThreeAPI.activateMixer(this.mixer);
        };

        InstanceAnimator.prototype.deActivateAnimator = function() {
            ThreeAPI.deActivateMixer(this.mixer);
        };

        return InstanceAnimator;

    });