"use strict";

var GuiAPI;

define([

    ],
    function(

    ) {

        var tempObj = new THREE.Object3D();

        var Plant = function(poolKey, activate, deactivate) {
            this.poolKey = poolKey;
            this.pos = new THREE.Vector3();
            this.normal = new THREE.Vector3(0, 1, 0);

            this.size = 2+Math.random()*3;

            this.colorRgba = {r:1, g:1, b:1, a: 1};

            this.config = {
                "min_y": 0.0,
                "max_y": 9999,
                "normal_ymin": 1.985,
                "normal_ymax": 0.92,
                "size_min": 7,
                "size_max": 22,
                "color_min": [0.95, 0.95, 0.95, 1],
                "color_max": [1, 1, 1, 1],
                "sprite": [4, 5, 1, 0]
            };

            this.sprite = [0, 7];

            this.isActive = false;

            this.bufferElement;

            var elementReady = function(bufferElement) {
                this.setBufferElement(bufferElement);
            }.bind(this);

            this.callbacks = {
                elementReady:elementReady,
                activatePlant:[activate],
                deactivatePlant:[deactivate]
            }

        };

        Plant.prototype.getIsActive = function() {
            return this.isActive;
        };

        Plant.prototype.applyPlantConfig = function(config) {

            for (var key in config) {
                this.config[key] = config[key];
            }

            this.size = MATH.randomBetween(this.config.size_min, this.config.size_max) || 5;

            this.colorRgba.r = MATH.randomBetween(this.config.color_min[0], this.config.color_max[0]) || 1;
            this.colorRgba.g = MATH.randomBetween(this.config.color_min[1], this.config.color_max[1]) || 1;
            this.colorRgba.b = MATH.randomBetween(this.config.color_min[2], this.config.color_max[2]) || 1;
            this.colorRgba.a = MATH.randomBetween(this.config.color_min[3], this.config.color_max[3]) || 1;
            this.sprite[0] = this.config.sprite[0] || 0;
            this.sprite[1] = this.config.sprite[1] || 7;
            this.sprite[2] = this.config.sprite[2] || 1;
            this.sprite[3] = this.config.sprite[3] || 0;

            if (this.config.asset_ids) {
                this.poolKey = MATH.getRandomArrayEntry(this.config.asset_ids)
            }

            if (config.surface) {

                if (this.pos.y < 0) {
                    this.pos.y = 0;
                    this.normal.set(0, 1, 0)
                }

            }

        };

        Plant.prototype.plantActivate = function() {
            this.isActive = true;
            MATH.callAll(this.callbacks.activatePlant, this);
        };

        Plant.prototype.plantDeactivate = function() {
            if (this.isActive === false) return;
            this.isActive = false;
            this.bufferElement.endLifecycleNow();
            MATH.callAll(this.callbacks.deactivatePlant, this);
        };

        Plant.prototype.getElementCallback = function() {
            return this.callbacks.elementReady;
        };

        Plant.prototype.setPlantPosition = function(pos) {
            this.pos.copy(pos);
        };

        Plant.prototype.getPlantElement = function() {
            return this.bufferElement;
        };

        Plant.prototype.setBufferElement = function(bufferElement) {
            this.bufferElement = bufferElement;
            this.bufferElement.setPositionVec3(this.pos);

            tempObj.lookAt(this.normal);
            tempObj.rotateZ(Math.random() * 10);

            this.bufferElement.setQuat(tempObj.quaternion);

            this.bufferElement.scaleUniform(this.size);
            this.bufferElement.sprite.x = this.sprite[0];
            this.bufferElement.sprite.y = this.sprite[1];
            this.bufferElement.sprite.z = this.sprite[2];
            this.bufferElement.sprite.w = this.sprite[3];
            this.bufferElement.setSprite(this.bufferElement.sprite);
            this.bufferElement.setColorRGBA(this.colorRgba);

            this.bufferElement.setAttackTime(1.0);
            this.bufferElement.setReleaseTime(1.0);
            this.bufferElement.startLifecycleNow();

        };

        return Plant;

    });