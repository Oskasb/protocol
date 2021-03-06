"use strict";


define([
        'application/ExpandingPool',
        'workers/main/instancing/Instantiator'
    ],
    function(
        ExpandingPool,
        Instantiator
    ) {


        var EffectSpawner = function() {

            this.config = {};

            this.instantiator = new Instantiator();


            var populateSector = function(sector, area, plantCount, parentPlant) {
                this.populateVegetationSector(sector, area, plantCount, parentPlant)
            }.bind(this);

            var depopulateSector = function(sector, area) {
                this.depopulateVegetationSector(sector, area)
            }.bind(this);

            var getPlantConfigs = function(key) {
                return this.plantConfigs[key]
            }.bind(this);

            this.callbacks = {
                populateSector:populateSector,
                depopulateSector:depopulateSector,
                getPlantConfigs:getPlantConfigs
            }
        };

        EffectSpawner.prototype.applyConfig = function(config) {
            for (var key in config) {
                this.config[key] = config[key];
            }
        };

        EffectSpawner.prototype.setupInstantiator = function() {
            this.instantiator.addInstanceSystem(this.config.spawner, this.config.spawner, this.config.asset_id, this.config.pool_size, this.config.render_order);
        };


        EffectSpawner.prototype.buildBufferElement = function(poolKey, cb) {
            this.instantiator.buildBufferElement(poolKey, cb)
        };


        EffectSpawner.prototype.deactivateEffect = function(effect) {
            effect.getParticleEffectBuffer().scaleUniform(0)
            this.instantiator.recoverBufferElement(effect.getSpawnerId(), effect.getParticleEffectBuffer());
            effect.bufferElement = null;
        };

        EffectSpawner.prototype.updateEffectSpawner = function() {
            this.instantiator.updateInstantiatorBuffers();
        };

        EffectSpawner.prototype.resetEffectSpawner = function() {
            this.instantiator.updateInstantiatorBuffers();
        };

        return EffectSpawner;

    });