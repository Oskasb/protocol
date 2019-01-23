"use strict";

define([

    ],
    function(

    ) {

        var GamePiece = function(pieceId, workerData) {

        };

        GamePiece.prototype.initGamePiece = function( pieceId, workerData) {
            this.pieceId = pieceId;
            this.workerData = workerData;
        };

        GamePiece.prototype.getWorkerData = function() {
            return this.workerData
        };

        GamePiece.prototype.readConfigData = function( key) {
            return this.workerData.readDataKey(key)
        };

        GamePiece.prototype.setWorldEntity = function( worldEntity) {
            this.worldEntity = worldEntity;
        };

        GamePiece.prototype.getWorldEntity = function() {
            return this.worldEntity;
        };

        GamePiece.prototype.setPieceAnimator = function( pieceAnimator) {
            this.pieceAnimator = pieceAnimator;
        };

        GamePiece.prototype.getPieceAnimator = function( ) {
            return this.pieceAnimator;
        };



        GamePiece.prototype.activatePieceAnimation = function(key, weight, timeScale) {
            this.getPieceAnimator().activatePieceAnimation(key, weight, timeScale);
        };

        GamePiece.prototype.getPlayingAnimation = function(key) {
            return this.getPieceAnimator().isActiveAnimationKey(key);
        };


        GamePiece.prototype.setPieceAttacher = function( pieceAttacher) {
            this.pieceAttacher = pieceAttacher;
        };

        GamePiece.prototype.getPieceAttacher = function( ) {
            return this.pieceAttacher;
        };


        GamePiece.prototype.attachWorldEntityToJoint = function(worldEntity, jointKey) {
            return this.getPieceAttacher().attachEntityToJoint(worldEntity, jointKey);
        };


        GamePiece.prototype.getJointActiveAttachment = function(key) {
           return this.getPieceAttacher().isActiveJointKey(key);
        };


        GamePiece.prototype.updateGamePiece = function(tpf, time) {
            this.pieceAnimator.updatePieceAnimations(tpf, time);
        };


        GamePiece.prototype.disposeGamePiece = function() {

            GuiAPI.printDebugText("DISPOSE GAME PIECE "+this.pieceId);
            MainWorldAPI.getWorldSimulation().despawnWorldEntity(this.worldEntity);

        };


        return GamePiece;


    });

