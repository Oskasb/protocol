"use strict";

define([

    ],
    function() {

        var tempObj = new THREE.Object3D();

        var CharacterFoot = function(key) {
            this.key = key;

            this.stepPosition = new THREE.Vector3();
            this.footPosition = new THREE.Vector3();

            this.footReach = new THREE.Vector3();

            this.forward = new THREE.Vector3();

            this.contactPoint = new THREE.Vector3();
            this.contactNormal = new THREE.Vector3();

            this.contactDuration = 0;

            var plantStepEffect = function(effect) {
                effect.setEffectPosition( this.contactPoint);
                effect.pos.y +=0.005;

                tempObj.up.copy(this.forward);
                tempObj.lookAt(this.contactNormal);

                effect.setEffectQuaternion(tempObj.quaternion);
                effect.activateEffectFromConfigId();

            }.bind(this);

            this.callbacks = {
                plantStepEffect:plantStepEffect
            }

        };

        CharacterFoot.prototype.setFootContact = function(bool) {
            this.footContact = bool;
        };

        CharacterFoot.prototype.setFootContactDepth = function(contactDepth) {
            this.footContactDepth = contactDepth;
        };
        CharacterFoot.prototype.getFootContactDepth = function() {
            return this.footContactDepth;
        };

        CharacterFoot.prototype.raycastJointDown = function(worldEntity, joint, config, tpf) {
            joint.getDynamicPosition(this.footPosition);
            this.footPosition.y += config.foot_margin;
            this.footReach.y = -config.foot_reach;

            let hit = PhysicsWorldAPI.raycastFromTo(this.footPosition, this.footReach, this.contactPoint, this.contactNormal);
            let terrainHit = false;
            if (hit) {
                terrainHit = PhysicsWorldAPI.testPointerIsTerrain(hit.ptr);
            }


            if (terrainHit) {

                if (!this.contactDuration) {
                    this.stepPosition.copy(this.footPosition);
                    let speed = worldEntity.getWorldEntityVelocity().lengthSq();

                    if (speed > 0.5 && this.contactNormal.y > 0.9) {
                        worldEntity.getWorldEntityForward(this.forward);
                        EffectAPI.buildEffectClassByConfigId('effect_footstep', this.callbacks.plantStepEffect)
                    }

                }

                this.contactDuration+= tpf;
                this.setFootContact(true);
                this.setFootContactDepth( 1.1 * Math.max(8 - this.contactDuration*3, 0) * (config.foot_reach - config.foot_margin ) / hit.fraction);

            } else {
                this.setFootContact(false);
                this.contactDuration = 0;
                this.setFootContactDepth(0);
                this.stepPosition.copy(this.footPosition)
            }

        };

        CharacterFoot.prototype.updateCharacterFoot = function(worldEntity, config, tpf) {

            let joint = worldEntity.getAttachmentJoint(this.key);
            this.raycastJointDown(worldEntity, joint, config, tpf);


        };

        return CharacterFoot;

    });

