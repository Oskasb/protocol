"use strict";


define([

    ],
    function(
    ) {


        var GameEffect = function(activateEffect, recoverEffect) {


            this.pos = new THREE.Vector3();
            this.normal = new THREE.Vector3();
            this.quat = new THREE.Quaternion();

            this.config = null;

            this.joint = null;

            this.attachParticles = [];
            this.activeParticles = [];

            let addEffectParticle = function(key, particle) {
                EffectAPI.addParticleToEffectOfClass(this.attachParticles.pop(), particle, this)
            }.bind(this);

            let positionUpdated = function(pos) {
                this.setEffectPosition(pos);
            }.bind(this);

            this.callbacks = {
                activateEffect : activateEffect,
                recoverEffect : recoverEffect,
                addEffectParticle:addEffectParticle,
                positionUpdated:positionUpdated
            }

        };

        GameEffect.prototype.setConfig = function(config) {
            this.config = config;
        };

        GameEffect.prototype.setEffectId = function(id) {
            this.effectId = id;
        };

        GameEffect.prototype.getEffectId = function() {
            return this.effectId;
        };

        GameEffect.prototype.attachParticleId = function(particleId) {
            this.attachParticles.push(particleId)
        };

        GameEffect.prototype.activateEffectParticle = function() {
            EffectAPI.buildEffect(this.callbacks.addEffectParticle)
        };

        GameEffect.prototype.activateEffectFromConfigId = function() {
            this.callbacks.activateEffect(this);
        };

        GameEffect.prototype.setEffectPosition = function(pos) {
            this.pos.copy(pos);
            for (var i = 0; i < this.activeParticles.length; i++) {
                this.activeParticles[i].setParticlePos(this.pos)
            }
        };

        GameEffect.prototype.setEffectNormal = function(normal) {
            this.normal.copy(normal);
        };

        GameEffect.prototype.setEffectQuaternion = function(quat) {
            this.quat.copy(quat);
        };

        GameEffect.prototype.attachToJoint = function(joint) {

            joint.getDynamicPosition(this.pos);
            joint.addPositionUpdateCallback(this.callbacks.positionUpdated);
            this.activateEffectFromConfigId();
            this.joint = joint;
        };

        GameEffect.prototype.recoverEffectOfClass = function() {

            if (this.joint) {
                this.joint.removePositionUpdateCallback(this.callbacks.positionUpdated);
                this.joint = null
            }

            while (this.activeParticles.length) {
                EffectAPI.recoverParticleEffect(this.activeParticles.pop())
            }

            this.callbacks.recoverEffect(this);
        };



        return GameEffect;

    });