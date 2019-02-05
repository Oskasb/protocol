"use strict";

var GuiAPI;

define([

    ],
    function(

    ) {

        var Plant = function(activate, deactivate) {
            this.pos = new THREE.Vector3();
            this.normal = new THREE.Vector3(0, 1, 0);

            this.size = 2+Math.random()*3;

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

        Plant.prototype.plantActivate = function() {
            this.isActive = true;
            MATH.callAll(this.callbacks.activatePlant, this);
        };

        Plant.prototype.plantDeactivate = function() {
            if (this.isActive === false) return;
            this.isActive = false;
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
            this.bufferElement.lookAtVec3(this.normal);
            this.bufferElement.scaleUniform(this.size);
            this.bufferElement.sprite.x = this.sprite[0];
            this.bufferElement.sprite.y = this.sprite[1];
            this.bufferElement.setSprite(this.bufferElement.sprite);
        };




        return Plant;

    });