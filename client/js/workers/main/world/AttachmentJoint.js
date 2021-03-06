"use strict";

define([
    ],
    function() {

        var AttachmentJoint = function(key, parentScale, dirtyCallback) {
            this.key = key;
            this.isDirty = false;

            this.parentScale = parentScale;
            this.obj3d = new THREE.Object3D();

            this.dynamicPosition = new THREE.Vector3();

            this.attachedEntity = null;

            this.positionUpdateCallbacks = [];

            let notifyUpdated = function(msg) {
                this.isDirty = true;
                dirtyCallback(msg);
            }.bind(this);

            let attachEffect = function(effect) {
                effect.attachToJoint(this)
            }.bind(this);

            this.callbacks = {
                notifyUpdated:notifyUpdated,
                attachEffect:attachEffect
            }

        };

        AttachmentJoint.prototype.getJointKey = function() {
            return this.key;
        };

        AttachmentJoint.prototype.getAttachEffectCallback = function() {
            return this.callbacks.attachEffect;
        };

        AttachmentJoint.prototype.setDynamicPositionXYZ = function(x, y, z) {
            this.dynamicPosition.set(x, y, z);
            MATH.callAll(this.positionUpdateCallbacks, this.dynamicPosition)
        };

        AttachmentJoint.prototype.addPositionUpdateCallback = function(cb) {
            this.positionUpdateCallbacks.push(cb)
        };

        AttachmentJoint.prototype.removePositionUpdateCallback = function(cb) {
            MATH.quickSplice(this.positionUpdateCallbacks, cb);
        };

        AttachmentJoint.prototype.getDynamicPosition = function(storeVec) {
            storeVec.copy(this.dynamicPosition);
        };

        AttachmentJoint.prototype.applyJointData = function(jointData) {
            this.obj3d.position.x = jointData.offset[0];
            this.obj3d.position.y = jointData.offset[1];
            this.obj3d.position.z = jointData.offset[2];

            this.obj3d.quaternion.set(0, 0, 0, 1);
            this.obj3d.rotateX(jointData.rot[0]);
            this.obj3d.rotateY(jointData.rot[1]);
            this.obj3d.rotateZ(jointData.rot[2]);

            this.obj3d.scale.x = jointData.scale[0];
            this.obj3d.scale.y = jointData.scale[1];
            this.obj3d.scale.z = jointData.scale[2];
            this.obj3d.scale.multiply(this.parentScale);
            this.obj3d.position.multiply(this.obj3d.scale)
        };

        AttachmentJoint.prototype.detatchAttachedEntity = function() {
            return this.attachedEntity;
        };

        AttachmentJoint.prototype.getAttachedEntity = function() {
            return this.attachedEntity;
        };

        AttachmentJoint.prototype.registerAttachedEntity = function(worldEntity, jointData) {
            this.attachedEntity = worldEntity;
            this.applyJointData(jointData);

        //    console.log("registerAttachedEntity", worldEntity);
            var msg = {attachedEntity:worldEntity, obj3d:this.obj3d, key:this.key};
            this.callbacks.notifyUpdated(msg);
        };



        return AttachmentJoint;

    });