"use strict";

var GuiAPI;

define([

    ],
    function(

    ) {

        var Plant = function() {
            this.pos = new THREE.Vector3();
            this.normal = new THREE.Vector3(0, 1, 0);

            this.bufferElement;

            var elementReady = function(bufferElement) {
                this.setBufferElement(bufferElement);
            }.bind(this);

            this.callbacks = {
                elementReady:elementReady
            }

        };

        Plant.prototype.getElementCallback = function() {
            return this.callbacks.elementReady;
        };

        Plant.prototype.setPlantPosition = function(pos) {
            this.pos.copy(pos);
        };

        Plant.prototype.setPlantNormal = function(normal) {
            this.normal.copy(normal);
        };

        Plant.prototype.setBufferElement = function(bufferElement) {
            this.bufferElement = bufferElement;
            this.bufferElement.setPositionVec3(this.pos);
            this.bufferElement.lookAtVec3(this.normal);
            this.bufferElement.scaleUniform(2+Math.random()*3);
            this.bufferElement.sprite.x = 0;
            this.bufferElement.sprite.y = 7;
            this.bufferElement.setSprite(this.bufferElement.sprite);
        };

        return Plant;

    });