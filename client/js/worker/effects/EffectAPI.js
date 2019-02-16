"use strict";

var EffectAPI;

define([
        'workers/WorkerData',
        'worker/effects/EffectSpawner',
        'worker/effects/ParticleEffect'
    ],
    function(
        WorkerData,
        EffectSpawner,
        ParticleEffect
    ) {

        var vegetation;
        var particleSpawner;


        var bufferConfigs = {};
        var workerData = new WorkerData('EFFECT', 'BUFFERS');

        EffectAPI = function() {

        };

        EffectAPI.initEffectAPI = function(onReady) {

            var onDataReady = function(isUpdate) {
                EffectAPI.applyEffectConfigs(workerData.data);
                if (!isUpdate) {
                    onReady();
                }

            };

            workerData.fetchData("spawners_default", onDataReady);
        };

        EffectAPI.applyEffectConfigs = function(data) {

            for (var i = 0; i < data.length; i++) {
                let sysKey = data[i].sys_key;
                if (!bufferConfigs[sysKey]) {
                    data[i] = {};
                }

                for (var key in data[i]) {
                    bufferConfigs[sysKey][key] = data[i][key]
                }
            }


        };

        EffectAPI.spawnParticleEffect = function(id, pos, vel) {
            particleSpawner.spawnActiveParticleEffect(id, pos, vel);
        };

        EffectAPI.recoverParticleEffect = function(effect) {
            particleSpawner.spawnActiveParticleEffect(id, pos, vel);
        };

        return EffectAPI;

    });