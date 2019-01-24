"use strict";

define([
    ],
    function() {

        var AttachmentJoint = function(key, dirtyCallback) {
            this.key = key;
            this.isDirty = false;

            this.obj3d = new THREE.Object3D();

            this.attachedEntity = null;

            let notifyUpdated = function() {
                this.isDirty = true;
                dirtyCallback();
            }.bind(this);

            this.callbacks = {
                notifyUpdated:notifyUpdated
            }

        };


        AttachmentJoint.prototype.getJointKey = function() {
            return this.key;
        };

        AttachmentJoint.prototype.detatchAttachedEntity = function() {
            return this.attachedEntity;
        };

        AttachmentJoint.prototype.getAttachedEntity = function() {
            return this.attachedEntity;
        };

        AttachmentJoint.prototype.registerAttachedEntity = function(worldEntity) {
            this.attachedEntity = worldEntity;
            console.log("registerAttachedEntity", worldEntity);
            this.callbacks.notifyUpdated();
        };



        return AttachmentJoint;

    });