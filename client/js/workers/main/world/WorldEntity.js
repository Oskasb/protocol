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
                var animState = new AnimationState(this.data.animKeys[i]);
                this.animationStates.push(animState);
                animState.setAnimationWeight(1);
                animState.setAnimationTimeScale(0.6+Math.random()*0.8)
            }

        };

        WorldEntity.prototype.initWorldEntity = function(time) {
            this.active = ENUMS.InstanceState.ACTIVE_VISIBLE;
            this.obj3d.position.x = 5 + Math.random() * 20 + Math.sin(time*1)*40;
            this.obj3d.position.z = 5 + Math.random() * 20 + Math.cos(time*1)*40;
            this.obj3d.rotateY(Math.random()*5);
            this.obj3d.rotateX((Math.random()-0.5)*0.1);
            this.obj3d.rotateZ((Math.random()-0.5)*0.1);

            this.obj3d.scale.x = 1+Math.random()*2;
            this.obj3d.scale.y = this.obj3d.scale.x;
            this.obj3d.scale.z = this.obj3d.scale.y;

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