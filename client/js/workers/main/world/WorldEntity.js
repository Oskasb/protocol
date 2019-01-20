"use strict";

define([
        'workers/main/world/AnimationState',
        'evt'
    ],
    function(
        AnimationState,
        evt
    ) {

        var eventData;

        var WorldEntity = function(assetId, data, ptr) {
            this.assetId = assetId;
            this.data = data;
            this.ptr = ptr;
            this.obj3d = new THREE.Object3D();
            this.animationStates = [];
            this.skin = {};
            this.attachedTo = false;
            this.slots = {};

            var setIsDirty = function() {
                this.setWorldEntityIsDirty();
            }.bind(this);

            this.callbacks = {
                setIsDirty:setIsDirty
            };

            this.setupAnimations();
        };

        WorldEntity.prototype.isCharacter = function() {
            return this.skin.character;
        };

        WorldEntity.prototype.isItem = function() {
            return this.skin.item;
        };

        WorldEntity.prototype.attachTo = function(worldEntity) {
            this.attachedTo = worldEntity;
        };

        WorldEntity.prototype.checkSlotFree = function(slot) {
            if (this.slots[slot]) {
                this.slots[slot] === 1;
                return true;
            }

        };

        WorldEntity.prototype.getSkin = function() {
            return this.skin;
        };

        WorldEntity.prototype.attachItem = function(worldEntity) {
            worldEntity.attachTo(this);
            this.slots[worldEntity.getSkin().slot] = worldEntity;

            eventData = evt.parser.attachmentEvent(this, worldEntity);
            evt.fire(this.ptr, eventData);

        };

        WorldEntity.prototype.setupAnimations = function() {

            if (this.data.skin) {
                this.skin = this.data.skin;
                if (this.isCharacter()) {
                    for (var i = 0; i < this.skin.slots.length; i++) {
                        this.slots[this.skin.slots[i]] = 1
                    }
                }
            }

            for (var i = 0; i < this.data.animKeys.length; i ++) {
                var animKey = ENUMS.getKey('Animations',this.data.animKeys[i]);
                var animState = new AnimationState(animKey, this.callbacks.setIsDirty);
                this.animationStates.push(animState);
            }
        };

        WorldEntity.prototype.setAnimationStateWeight = function(key, weight) {
            this.getAnimationState(key).setAnimationWeight(weight);;
        };

        WorldEntity.prototype.setAnimationStateTimeScale = function(key, timeScale) {
            this.getAnimationState(key).setAnimationTimeScale(timeScale);
        };

        WorldEntity.prototype.getAnimationState = function(key) {
            return MATH.getFromArrayByKeyValue(this.animationStates, 'key', key)
        };

        WorldEntity.prototype.getWorldEntityPosition = function(storeVec) {
            storeVec.copy(this.obj3d.position);
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
        };

        WorldEntity.prototype.setWorldEntityIsDirty = function() {
            this.worldEntityIsDirty = true;
        };

        WorldEntity.prototype.relayEntityState = function() {

            eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData);
            if (this.animationStates.length) {
                eventData = evt.parser.animationEvent(this);
                evt.fire(this.ptr, eventData);
            }
        };

        WorldEntity.prototype.decommissionWorldEntity = function() {
            this.active = ENUMS.InstanceState.DECOMISSION;
            eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData)
        };

        return WorldEntity;

    });