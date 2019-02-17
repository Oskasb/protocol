"use strict";


define([

    ],
    function(
    ) {


        var DurableStamp = function(activateEffect, recoverEffect) {


            this.pos = new THREE.Vector3();
            this.normal = new THREE.Vector3();
            this.quat = new THREE.Quaternion();

            this.config = null;

            this.attachParticles = [];
            this.activeParticles = [];

            var addEffectParticle = function(key, particle) {

                EffectAPI.addParticleToEffectOfClass(this.attachParticles.pop(), particle, this)
            }.bind(this);

            this.callbacks = {
                activateEffect : activateEffect,
                recoverEffect : recoverEffect,
                addEffectParticle:addEffectParticle
            }

        };

        DurableStamp.prototype.setConfig = function(config) {
            this.config = config;
        };

        DurableStamp.prototype.setEffectId = function(id) {
            this.effectId = id;
        };

        DurableStamp.prototype.getEffectId = function() {
            return this.effectId;
        };

        DurableStamp.prototype.attachParticleId = function(particleId) {
            this.attachParticles.push(particleId)
        };

        DurableStamp.prototype.activateEffectParticle = function() {
            EffectAPI.buildEffect(this.callbacks.addEffectParticle)
        };

        DurableStamp.prototype.activateEffectFromConfigId = function() {
            this.callbacks.activateEffect(this);
        };


        DurableStamp.prototype.setEffectPosition = function(pos) {
            this.pos.copy(pos);
        };

        DurableStamp.prototype.setEffectNormal = function(normal) {
            this.normal.copy(normal);
        };

        DurableStamp.prototype.setEffectQuaternion = function(quat) {
            this.quat.copy(quat);
        };

        DurableStamp.prototype.recoverEffectOfClass = function() {

            while (this.activeParticles.length) {
                EffectAPI.recoverParticleEffect(this.activeParticles.pop())
            }

            this.callbacks.recoverEffect(this);
        };



        return DurableStamp;

    });