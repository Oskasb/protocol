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
            this.setupAnimations()
        };

        WorldEntity.prototype.setupAnimations = function() {

            for (var i = 0; i < this.data.animKeys.length; i ++) {
                var animState = new AnimationState(this.data.animKeys[i]);
                this.animationStates.push(animState);
                animState.setAnimationWeight(1);
                animState.setAnimationTimeScale(0.6+Math.random()*0.8)
            }

        };

        WorldEntity.prototype.initWorldEntity = function(time) {
            this.active = 1;
            this.obj3d.position.x = 35 + Math.random() * 20 + Math.sin(time*1)*40;
            this.obj3d.position.z = 35 + Math.random() * 20 + Math.cos(time*1)*40;
            this.obj3d.rotateY(Math.random()*5);

            eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData);
            if (this.animationStates.length) {
                eventData = evt.parser.animationEvent(this);
                evt.fire(this.ptr, eventData);
            }
        };

        WorldEntity.prototype.decommissionWorldEntity = function() {
            this.active = 0;
            eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData)
        };

        return WorldEntity;

    });