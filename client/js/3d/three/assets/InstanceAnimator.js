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


        InstanceAnimator.prototype.getSyncSource = function(sync) {
            for (var i = 0; i < this.channels.length; i++ ) {
                if (this.channels[i].sync === sync) {
                    return this.channels[i];
                }
            }
        };



        InstanceAnimator.prototype.startChannelAction = function(channel, action, weight, fade, loop, clamp, timeScale, sync) {
    //        console.log("start chan action", action);
            
                action.reset();
                action.enabled = true;
                action.loop = loopModes[loop];
                action.clampWhenFinished = clampModes[clamp];
                action.play();

                action.setEffectiveWeight( weight );

                action.fadeIn(fade);

                action.setEffectiveTimeScale( timeScale );


                if (sync) {
                    let syncSrc = this.getSyncSource(sync);
                    if (syncSrc) {
                        syncSrc.setEffectiveTimeScale(timeScale);
                        action.syncWith(syncSrc);
                    }
                }

                action.sync = sync;

                channel.push(action);

        };

        InstanceAnimator.prototype.fadeinChannelAction = function(channel, toAction, weight, fade, loop, clamp, timeScale, sync) {

            if (channel.indexOf(toAction) === -1) {

                this.startChannelAction(channel, toAction, weight, fade, loop, clamp, timeScale, sync);
                var fromAction = channel.pop();
                fromAction.fadeOut(fade)

            } else {
                toAction._scheduleFading(fade, toAction.getEffectiveWeight(), weight / toAction.getEffectiveWeight());
                toAction.setEffectiveTimeScale( timeScale );
            }

        };


        InstanceAnimator.prototype.stopChannelAction = function(channel, action) {

            MATH.quickSplice(channel, action);
            action.stop();
        };


        InstanceAnimator.prototype.updateAnimationAction = function(animationKey, weight, timeScale, fade, chan, loop, clamp, sync) {
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



            if (weight) {

                if (this.channels[chan].length) {
                    this.fadeinChannelAction(this.channels[chan], action, weight, fade, loop, clamp, timeScale, sync)

                } else {
                    this.startChannelAction(this.channels[chan], action, weight, fade, loop, clamp, timeScale, sync)
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