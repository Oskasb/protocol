"use strict";

define([

    ],
    function() {

        var action;
        var animKey;

        var InstanceAnimator = function(instancedModel) {
            this.animationActions = {};
            this.instancedModel = instancedModel;

            this.channels = [];

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
                action.setEffectiveWeight( 1 );
                action.setEffectiveTimeScale( 1 );
            //    action.play();
                this.actionKeys.push(animMap[key]);
                this.animationActions[animMap[key]] = action;
            }
        };

        InstanceAnimator.prototype.initAnimatior = function() {

            for (var key in this.animationActions) {
                var action = this.animationActions[key];
                action.stop();
                action.on = false;
            //    action.setEffectiveWeight( 0 );
            //    action.enabled = false;
            }
        };


        InstanceAnimator.prototype.addAnimationAction = function(actionClip) {
            if (!actionClip) {
                console.log("No Anim Clip", this)
                return;
            }

            return this.mixer.clipAction( actionClip );
        };


        var loopModes = [THREE.LoopOnce, THREE.LoopRepeat, THREE.LoopPingPong];
        var clampModes = [false, true];

        InstanceAnimator.prototype.startChannelAction = function(channel, action, weight, fade, loop, clamp) {
    //        console.log("start chan action", action);
            action.reset();
            action.enabled = true;

            action.loop = loopModes[loop];
            action.clampWhenFinished = clampModes[clamp];

            action.setEffectiveWeight( weight );

            action.play();
            action.fadeIn(fade);
            channel.push(action);

        };

        InstanceAnimator.prototype.fadeinChannelAction = function(channel, toAction, weight, fade, loop, clamp) {

            var fromAction = channel.pop();

            if (fromAction === toAction) {

    //            console.log("_sched fade");
                toAction._scheduleFading(fade, 1, weight / toAction.getEffectiveWeight());
                channel.push(toAction);
            } else {

    //            console.log("X fade");
            //    toAction.setEffectiveWeight(weight);
                fromAction.fadeOut(fade)
            //    toAction.crossFadeFrom(fromAction, toAction, fade)
                this.startChannelAction(channel, toAction, weight, fade, loop, clamp)
            }



        };


        InstanceAnimator.prototype.stopChannelAction = function(channel, action) {

            MATH.quickSplice(channel, action);
            action.stop();
        };



        InstanceAnimator.prototype.updateAnimationAction = function(animationKey, weight, timeScale, fade, chan, loop, clamp) {
            animKey = ENUMS.getKey('Animations', animationKey);
            action = this.animationActions[animKey];

        //    console.log("anim event:", animationKey, weight, timeScale, fade, chan);

            if (!action) {
                console.log("Bad anim event");
                return;
            }

            if (!this.channels[chan]) {
        //        console.log("Add anim channel", chan);
                this.channels[chan] = [];
                return;
            }

            action.setEffectiveTimeScale( timeScale );

            if (weight) {

                if (this.channels[chan].length) {
                    this.fadeinChannelAction(this.channels[chan], action, weight, fade, loop, clamp)

                } else {
                    this.startChannelAction(this.channels[chan], action, weight, fade, loop, clamp)
                }

            } else {

                if (fade) {
                    action.fadeOut(fade);
                } else  {
                    this.stopChannelAction(this.channels[chan], action)
                }
            }

        };

        InstanceAnimator.prototype.activateAnimator = function() {
        //    this.initAnimatior()
            ThreeAPI.activateMixer(this.mixer);
        };

        InstanceAnimator.prototype.deActivateAnimator = function() {
            ThreeAPI.deActivateMixer(this.mixer);
        };

        return InstanceAnimator;

    });