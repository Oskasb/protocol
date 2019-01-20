"use strict";

define([
        'game/pieces/PieceAnim'
    ],
    function(
        PieceAnim
    ) {

        var PieceAnimator = function() {

            this.animations = {};
            this.activeAnimations = [];
            this.removes = []
        };

        PieceAnimator.prototype.initPieceAnimator = function(piece, onReady) {
            this.gamePiece = piece;
            this.worldEntity = piece.getWorldEntity();
            piece.setPieceAnimator(this);
            this.setupPieceAnimations(onReady)
        };

        PieceAnimator.prototype.setupPieceAnimations = function(onReady) {

            var animations = this.gamePiece.readConfigData('animations');

            if (animations) {

                for (var key in animations) {
                    this.animations[key] = new PieceAnim(key, this.gamePiece.getWorkerData(), this.worldEntity.getAnimationState(key));
                }
            }

            onReady(this);
        };

        PieceAnimator.prototype.getPieceAnim = function(animationKey) {
            return this.animations[animationKey];
        };

        PieceAnimator.prototype.activatePieceAnimation = function(animationKey, weight, timeScale) {

            var anim = this.getPieceAnim(animationKey);
            anim.activateNow(weight, timeScale);

            if (this.activeAnimations.indexOf(anim) === -1) {
                this.activeAnimations.push(anim);
            }

        };

        PieceAnimator.prototype.activeAnimationKey = function(key) {
            return MATH.getFromArrayByKeyValue(this.activeAnimations, 'key', key);
        };

        PieceAnimator.prototype.updatePieceAnimations = function(tpf, time) {

            for (var i = 0; i < this.activeAnimations.length; i++) {
                this.activeAnimations[i].updateAnimation(tpf, time, this.removes);
            }

            while (this.removes.length) {
                MATH.quickSplice(this.activeAnimations, this.removes.pop());
            }

        };

        return PieceAnimator;

    });

