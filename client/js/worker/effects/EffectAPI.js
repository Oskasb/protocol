"use strict";

var EffectAPI;

define([
        'application/ExpandingPool',
        'workers/WorkerData',
        'worker/effects/EffectSpawner',
        'worker/effects/ParticleEffect'
    ],
    function(
        ExpandingPool,
        WorkerData,
        EffectSpawner,
        ParticleEffect
    ) {



        var createEffect = function(key, cb) {
            cb(key, new ParticleEffect());
        };

        var effectPool = new ExpandingPool('effect', createEffect);

        var effectSpawners = {};
        var particleConfigs = {};

        var activeEffects = [];

        var spawnerData = new WorkerData('EFFECT', 'BUFFERS');
        var particlesData = new WorkerData('EFFECT', 'PARTICLES');


        EffectAPI = function() {

        };

        EffectAPI.initEffectAPI = function(onReady) {

            var onParticlesReady = function(isUpdate) {
                EffectAPI.applyParticleConfigs(particlesData.data);
                if (!isUpdate) {
                    onReady();
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


            for (var i = 0; i < activeEffects.length; i++) {
                activeEffects[i].applyConfig()
            }

        };


        EffectAPI.setupParticleEffect = function(bufferElement, spawnerId) {
            let effect = activateEffects[spawnerId].pop();
            effect.setBufferElement(bufferElement);
            activeEffects.push(effect);
        };

        var activateEffects = {};

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
            MATH.quickSplice(activeEffects, effect);
            effect.recoverParticleEffect()
        };

        return EffectAPI;

    });