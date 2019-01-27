"use strict";

define([
        'game/pieces/PieceAttachment'
    ],
    function(
        PieceAttachment
    ) {

        var PieceAttacher = function() {
            this.pieceAttachments = {};
        };

        PieceAttacher.prototype.initPieceAttacher = function(piece) {
            this.gamePiece = piece;
            this.worldEntity = piece.getWorldEntity();
            piece.setPieceAttacher(this);
            this.setupPieceAttachments()
        };

        PieceAttacher.prototype.setupPieceAttachments = function() {

            var skeleton_rig = this.gamePiece.readConfigData('skeleton_rig');
            this.gamePiece.setRigKey(skeleton_rig);


            if (skeleton_rig) {

                var onDataReady = function() {

                    var joints = this.gamePiece.getRigData().readDataKey('joints');

                    for (var key in joints) {
                        this.pieceAttachments[key] = new PieceAttachment(key, this.gamePiece.getRigData(), this.worldEntity.getAttachmentJoint(key));
                    }

                }.bind(this);

                this.gamePiece.rigData.fetchData(skeleton_rig, onDataReady);

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

