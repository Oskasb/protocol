"use strict";

define([
        'application/ExpandingPool',
        'worker/effects/classes/DurableStamp',
        'worker/effects/classes/GameEffect'
    ],

    function(
        ExpandingPool,
        DurableStamp,
        GameEffect
    ) {


        var effectClass = {
            DurableStamp          :DurableStamp,
            GameEffect            :GameEffect
        };


        var EffectBuilder = function() {
            this.configs = {};
            this.effectPools = {};

            this.activeEffects = {};

            var recoverEffect = function(effectOfClass) {
                  this.recoverEffectOfClass(effectOfClass)
            }.bind(this);

            var activateEffect = function(effectOfClass) {
                this.activateEffectOfClass(this.configs[effectOfClass.getEffectId()], effectOfClass)
            }.bind(this);

            this.callbacks = {
                activateEffect:activateEffect,
                recoverEffect:recoverEffect
            };

        };

        EffectBuilder.prototype.initEffectBuilder = function(dataId, workerData, onReady, rebuildFx) {

            var onDataReady = function(isUpdate) {
                this.applyConfigs(workerData.data);
                if (!isUpdate) {
                    onReady();
                } else {
                    rebuildFx();
                }

            }.bind(this);

            workerData.fetchData(dataId, onDataReady);

        };

        EffectBuilder.prototype.applyConfigs = function(data) {

            var createEffect = function(key, cb) {
                let fx = new effectClass[this.configs[key].effect_class](this.callbacks.activateEffect, this.callbacks.recoverEffect);
                fx.setEffectId(key);


                cb(fx)
            }.bind(this);

            for (var key in data) {


                if (this.activeEffects[key]) {
                    while (this.activeEffects[key].length) {
                        let fx = this.activeEffects[key].pop();
                        fx.recoverEffectOfClass();
                    }
                } else {
                    this.activeEffects[key] = [];
                }

                this.configs[key] = data[key];
                this.effectPools[key] = new ExpandingPool(key, createEffect)
            }

        };


        EffectBuilder.prototype.buildEffectByConfigId = function(configId, callback) {

            this.effectPools[configId].getFromExpandingPool(callback)
        };


        EffectBuilder.prototype.activateEffectOfClass = function(config, effectOfClass) {

            let cfgId = effectOfClass.getEffectId();

            let maxActive = this.configs[cfgId].max_active || 100;

            if (this.activeEffects[cfgId].length + 1 > maxActive) {
                let recover = this.activeEffects[cfgId].shift();
                recover.recoverEffectOfClass();
            }

            this.activeEffects[cfgId].push(effectOfClass);
            effectOfClass.setConfig(config);

            let particles = config.particles;
            for (var i = 0; i < particles.length; i++) {
                this.addParticleGroup(effectOfClass, particles[i])
            }
        };

        EffectBuilder.prototype.addParticleGroup = function(effectOfClass, particleGroup) {
            let count = Math.round(MATH.randomBetween(particleGroup.count[0], particleGroup.count[1]));

            for (var i = 0; i < count; i++) {
                effectOfClass.attachParticleId(particleGroup.id);
                effectOfClass.activateEffectParticle()
            }
        };


        EffectBuilder.prototype.addParticle = function(particleEffect, effectOfClass) {

            let classCfg = effectOfClass.config;
            if (classCfg.spread_pos) {
                MATH.randomVector(particleEffect.offset);
                particleEffect.offset.x *= classCfg.spread_pos[0];
                particleEffect.offset.y *= classCfg.spread_pos[1];
                particleEffect.offset.z *= classCfg.spread_pos[2];
            } else {
                particleEffect.offset.set(0, 0, 0);
            }

            particleEffect.setParticlePos(effectOfClass.pos);

            particleEffect.setParticleQuat(effectOfClass.quat);

            effectOfClass.activeParticles.push(particleEffect);

            EffectAPI.activateParticleEffect(particleEffect)

        };


        EffectBuilder.prototype.recoverEffectOfClass = function(effectOfClass) {
            this.effectPools[effectOfClass.getEffectId()].returnToExpandingPool(effectOfClass);
        };

        return EffectBuilder;

    });

