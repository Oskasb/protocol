"use strict";

define([
        'workers/main/world/AnimationState',
        'workers/main/world/AttachmentJoint',
        'evt'
    ],
    function(
        AnimationState,
        AttachmentJoint,
        evt
    ) {

        var eventData;

        var WorldEntity = function(assetId, data, ptr) {
            this.assetId = assetId;
            this.data = data;
            this.ptr = ptr;
            this.obj3d = new THREE.Object3D();
            this.velocity = new THREE.Vector3(),
            this.animationStates = [];
            this.attachmentJoints = [];

            this.jointMap = {};

            this.skin = {};
            this.slots = {};

            this.attachmentUpdates = [];

            var setIsDirty = function() {
                this.setWorldEntityIsDirty();
            }.bind(this);

            var setAttachmentUpdated = function(joint) {
                this.addAttachmentUpdate(joint)
            }.bind(this);

            var entityRenderEvent = function(evtArgs) {
                this.handleEntityRenderEvent(evtArgs)
            }.bind(this);

            this.callbacks = {
                setIsDirty:setIsDirty,
                setAttachmentUpdated:setAttachmentUpdated,
                entityRenderEvent:entityRenderEvent
            };

            evt.on(this.ptr+ENUMS.Numbers.PTR_PING_OFFSET, this.callbacks.entityRenderEvent);
            this.setupAnimations();

        };


        WorldEntity.prototype.setupAnimations = function() {

            for (var i = 0; i < this.data.jointKeys.length; i ++) {
                var key = ENUMS.getKey('Joints',this.data.jointKeys[i]);
                var joint = new AttachmentJoint(key, this.obj3d.scale, this.callbacks.setAttachmentUpdated);
                this.attachmentJoints[i] = joint;
                this.jointMap[this.data.jointKeys[i]] = i;
            }

            for (var i = 0; i < this.data.animKeys.length; i ++) {
                var animKey = ENUMS.getKey('Animations',this.data.animKeys[i]);
                var animState = new AnimationState(animKey, this.callbacks.setIsDirty);
                this.animationStates.push(animState);
            }
        };


        WorldEntity.prototype.getAnimationState = function(key) {
            return MATH.getFromArrayByKeyValue(this.animationStates, 'key', key)
        };

        WorldEntity.prototype.getAttachmentJoint = function(key) {
            return MATH.getFromArrayByKeyValue(this.attachmentJoints, 'key', key)
        };

        WorldEntity.prototype.setWorldEntityVelocity = function(v3) {
            this.velocity.copy(v3);
        };

        WorldEntity.prototype.getWorldEntityVelocity = function() {
            return this.velocity;
        };

        WorldEntity.prototype.getWorldEntityPosition = function(storeVec) {
            storeVec.copy(this.obj3d.position);
        };

        WorldEntity.prototype.getWorldEntityScale = function(storeVec) {
            storeVec.copy(this.obj3d.scale);
        };

        WorldEntity.prototype.getWorldEntityQuat = function(storeQuat) {
            storeQuat.copy(this.obj3d.quaternion);
        };

        WorldEntity.prototype.setWorldEntityPosition = function(posVec) {
            this.obj3d.position.copy(posVec);
            this.setWorldEntityIsDirty();
        };

        WorldEntity.prototype.setWorldEntityQuaternion = function(quat) {
            this.obj3d.quaternion.copy(quat);
            this.setWorldEntityIsDirty();
        };

        WorldEntity.prototype.setWorldEntityScale = function(scale) {
            this.obj3d.scale.copy(scale);
            this.setWorldEntityIsDirty();
        };

        WorldEntity.prototype.initWorldEntity = function(time) {
            this.active = ENUMS.InstanceState.ACTIVE_VISIBLE;
            this.setWorldEntityIsDirty();
        };



        WorldEntity.prototype.updateWorldEntity = function() {
            if (this.worldEntityIsDirty) {
                this.relayEntityState();
                this.worldEntityIsDirty = false;
            }

            if (this.attachmentUpdates.length) {
                this.relayAttachmentState();
            //    this.attachmentUpdated = false;
            }

        };

        WorldEntity.prototype.setWorldEntityIsDirty = function() {
            this.worldEntityIsDirty = true;
        };

        WorldEntity.prototype.setAttachmentUpdated = function() {
            this.attachmentUpdated = true;
        };

        WorldEntity.prototype.addAttachmentUpdate = function(attachmentUpdate) {
            this.attachmentUpdates.push(attachmentUpdate);
        };

        WorldEntity.prototype.relayEntityState = function() {

            eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData);

            if (this.animationStates.length) {
                eventData = evt.parser.animationEvent(this);
                evt.fire(this.ptr, eventData);
            }

        };

        WorldEntity.prototype.relayAttachmentState = function() {
                eventData = evt.parser.attachmentPointEvent(this.attachmentUpdates);
                evt.fire(this.ptr, eventData);
                console.log("Attachment Updated");
        };

        WorldEntity.prototype.handleEntityRenderEvent = function(evtArgs) {

            if (evtArgs[0] === ENUMS.Event.DYNAMIC_JOINT) {

                let joint = this.attachmentJoints[this.jointMap[evtArgs[1]]];
                joint.setDynamicPositionXYZ(evtArgs[2], evtArgs[3], evtArgs[4])

            }

        };

        WorldEntity.prototype.decommissionWorldEntity = function() {
            this.active = ENUMS.InstanceState.DECOMISSION;
            eventData = evt.parser.worldEntityEvent(this);
            evt.removeListener(this.ptr, this.callbacks.entityRenderEvent);
            evt.fire(this.ptr, eventData)
        };

        return WorldEntity;

    });