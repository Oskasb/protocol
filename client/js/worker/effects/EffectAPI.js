"use strict";

var EffectAPI;

define([
        'application/ExpandingPool',
        'workers/WorkerData',
        'worker/effects/EffectSpawner',
        'worker/effects/ParticleEffect',
        'worker/effects/EffectBuilder'
    ],
    function(
        ExpandingPool,
        WorkerData,
        EffectSpawner,
        ParticleEffect,
        EffectBuilder
    ) {



        var createEffect = function(key, cb) {
            cb(key, new ParticleEffect());
        };

        var effectPool = new ExpandingPool('effect', createEffect);

        var effectBuilder = new EffectBuilder();

        var effectSpawners = {};
        var particleConfigs = {};

        var activeEffects = {};
        var activateEffects = {};

        var spawnerData = new WorkerData('EFFECT', 'BUFFERS');
        var particlesData = new WorkerData('EFFECT', 'PARTICLES');


        EffectAPI = function() {

        };

        EffectAPI.initEffectAPI = function(onReady) {

            var onParticlesReady = function(isUpdate) {
                EffectAPI.applyParticleConfigs(particlesData.data);
                if (!isUpdate) {
                    effectBuilder.initEffectBuilder('effects_default', new WorkerData('EFFECT', 'EFFECTS'), onReady, rebuildFx)
                }
            };

            var onDataReady = function(isUpdate) {
                EffectAPI.applyEffectConfigs(spawnerData.data);
                if (!isUpdate) {
                    particlesData.fetchData("particle_default", onParticlesReady);
                }

            };

            spawnerData.fetchData("spawners_default", onDataReady);
        };

        EffectAPI.applyEffectConfigs = function(data) {

            for (var i in data) {
                let spawner = data[i].spawner;

                if (effectSpawners[spawner]) {
                    effectSpawners[spawner].resetEffectSpawner()
                }

                effectSpawners[spawner] = new EffectSpawner();
                effectSpawners[spawner].applyConfig(data[i]);
                effectSpawners[spawner].setupInstantiator()
            }
            rebuildFx()
        };

        var rebuildFx = function() {
            let rebuild = {};

            for (var key in activeEffects) {
                rebuild[key] = [];

                while (activeEffects[key].length) {
                    let fx = activeEffects[key].pop();
                    fx.recoverParticleEffect();
                    rebuild[key].push(fx)
                }

                while (rebuild[key].length) {
                    EffectAPI.activateParticleEffect(rebuild[key].pop())
                }
            }

        };


        EffectAPI.applyParticleConfigs = function(data) {

            console.log(data)

            for (var i in data) {

                let particleId = data[i].particle_id;

                if (!particleConfigs[particleId]) {
                    particleConfigs[particleId] = {}
                }

                for (var key in data[i]) {
                    particleConfigs[particleId][key] = data[i][key]
                }

            }

            rebuildFx()


        };


        EffectAPI.setupParticleEffect = function(bufferElement, spawnerId) {
            let effect = activateEffects[spawnerId].pop();
            effect.setBufferElement(bufferElement);

            if (!activeEffects[spawnerId]) {
                activeEffects[spawnerId] = []
            }

            activeEffects[spawnerId].push(effect);
        };



        EffectAPI.activateParticleEffect = function(effect) {
            effect.setConfig(EffectAPI.getEffectConfig( effect.getParticleId()));
            effect.applyConfig();
            let spawnerId = effect.getSpawnerId();

            if (!activateEffects[spawnerId]) {
                activateEffects[spawnerId] = []
            }
            activateEffects[spawnerId].push(effect);

            effectSpawners[spawnerId].buildBufferElement(spawnerId, EffectAPI.setupParticleEffect)
        };

        EffectAPI.getEffectConfig = function(particleId) {
            return particleConfigs[particleId]
        };

        EffectAPI.getParticleEffect = function(callback) {
            effectPool.getFromExpandingPool(callback)
        };

        EffectAPI.recoverParticleEffect = function(effect) {
            MATH.quickSplice(activeEffects[effect.getSpawnerId()], effect);
            effect.recoverParticleEffect()
        };

        EffectAPI.buildEffect = function(callback) {
            effectPool.getFromExpandingPool(callback)
        };


        EffectAPI.buildEffectClassByConfigId = function(configId, callback) {
            effectBuilder.buildEffectByConfigId(configId, callback)
        };

        EffectAPI.addParticleToEffectOfClass = function(particleId, particleEffect, effectOfClass) {
            particleEffect.setParticleId(particleId);
            effectBuilder.addParticle(particleEffect, effectOfClass)
        };

        return EffectAPI;

    });