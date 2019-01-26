"use strict";

define([

    ],
    function(

    ) {


        var PieceAnim = function(key, workerData, animState) {
            this.key = key;
            this.dataKey = 'animations';
            this.workerData = workerData;
            this.animationState = animState;
            this.currentTime = 0;
            this.duration = 0;
            this.startTime = 0;
            this.fade = 0.25;
            this.ts = 1;
            this.w = 1;
            this.channel = 0;

        };

        PieceAnim.prototype.getData = function() {
            return this.workerData.readDataKey(this.dataKey)[this.key];
        };

        PieceAnim.prototype.activateNow = function(weight, timeScale) {
            this.currentTime = 0;
            this.animationState.setAnimationLoop(this.getData()['loop']);
            this.animationState.setAnimationClamp(this.getData()['clamp']);
            this.setWeight(weight || 1);
            this.setTimeScale(timeScale || 1);
            this.setFadeTime(timeScale || 1);
            this.setChannel(this.getData()['channel'] || 0);
            this.duration = this.getData()['duration'] / this.ts;
        };


        PieceAnim.prototype.setWeight = function(w) {
        //    if (this.w === w) return;
            this.w = w * this.getData()['weight'];
            this.animationState.setAnimationWeight(this.w)
        };

        PieceAnim.prototype.setTimeScale = function(ts) {
        //    if (this.ts === ts) return;
            this.ts = ts* this.getData()['time_scale'];
            this.animationState.setAnimationTimeScale(this.ts)
        };

        PieceAnim.prototype.setFadeTime = function(timeScale) {
            this.fade = timeScale * this.getData()['fade'];
            this.animationState.setAnimationFade(this.fade)
        };

        PieceAnim.prototype.setChannel = function(channel) {
            this.channel = channel;
            this.animationState.setAnimationChannel(this.channel)
        };

        PieceAnim.prototype.updateAnimation = function(tpf, time, removes) {
            this.currentTime += tpf;

            if (this.duration < this.currentTime) {

                this.setWeight(0);

                if (this.duration + this.fade < this.currentTime) {
                    this.setFadeTime(0);
                    removes.push(this);
                }

            }
        };


        return PieceAnim;

    });

