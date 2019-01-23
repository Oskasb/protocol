"use strict";

define([
        'game/pieces/PieceAttachment'
    ],
    function(
        PieceAttachment
    ) {

        var PieceAttacher = function() {
            this.pieceAttachments = {};
            this.activeJoints = [];

        };

        PieceAttacher.prototype.initPieceAttacher = function(piece) {
            this.gamePiece = piece;
            this.worldEntity = piece.getWorldEntity();
            piece.setPieceAttacher(this);
            this.setupPieceAttachments()
        };

        PieceAttacher.prototype.setupPieceAttachments = function() {

            var joints = this.gamePiece.readConfigData('joints');

            if (joints) {

                for (var key in joints) {
                    this.pieceAttachments[key] = new PieceAttachment(key, this.gamePiece.getWorkerData(), this.worldEntity.getAttachmentJoint(key));
                }
            }
        };


        PieceAttacher.prototype.attachEntityToJoint = function(entity, jointKey) {
            this.getAttachmentJoint(jointKey).setAttachedWorldEntity(entity);
        };

        PieceAttacher.prototype.getAttachmentJoint = function(key) {
            return this.pieceAttachments[key];
        };

        PieceAttacher.prototype.isActiveJointKey = function(key) {
            return this.getAttachmentJoint(key).getActiveAttachment();
        };

        PieceAttacher.prototype.releaseJointKey = function(key) {
            return this.getAttachmentJoint(key).releaseActiveAttachment();
        };

        PieceAttacher.prototype.updatePieceAttachments = function(tpf, time) {



        };

        return PieceAttacher;

    });

