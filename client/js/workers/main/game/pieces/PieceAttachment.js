"use strict";

define([

    ],
    function(

    ) {

        var PieceAttachment = function(key, workerData, attachmentJoint) {
            this.key = key;
            this.dataKey = 'joints';
            this.workerData = workerData;
            this.attachmentJoint = attachmentJoint;
            this.attachedWorldEntity = null;
        };

        PieceAttachment.prototype.getData = function() {
            return this.workerData.readDataKey(this.dataKey)[this.key];
        };

        PieceAttachment.prototype.setAttachedWorldEntity = function(worldEntity) {
            this.attachedWorldEntity = worldEntity;
            console.log("Attach WE to PieceAttachment", worldEntity)
        };

        PieceAttachment.prototype.releaseAttachedWorldEntity = function() {

            console.log("Release WE PieceAttachment", this.attachedWorldEntity);
            this.attachedWorldEntity = null;
        };

        PieceAttachment.prototype.getActiveAttachment = function() {
            return this.attachedWorldEntity;
        };

        PieceAttachment.prototype.activateNow = function(weight, timeScale) {

        };

        return PieceAttachment;

    });

