"use strict";

define([
    'evt'
    ],
    function(
        evt
    ) {

        var WorldEntity = function(assetId, ptr) {
            this.assetId = assetId;
            this.ptr = ptr;
            this.obj3d = new THREE.Object3D();
        };

        WorldEntity.prototype.initWorldEntity = function(time) {
            this.active = 1;
            this.obj3d.position.x = 35 + Math.random() * 20 + Math.sin(time*1)*40;
            this.obj3d.position.z = 35 + Math.random() * 20 + Math.cos(time*1)*40;
            this.obj3d.rotateY(Math.random()*5);
            var eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData)
        };

        WorldEntity.prototype.decommissionWorldEntity = function() {
            this.active = 0;
            var eventData = evt.parser.worldEntityEvent(this);
            evt.fire(this.ptr, eventData)
        };

        return WorldEntity;

    });