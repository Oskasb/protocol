"use strict";


define([
        'application/ExpandingPool',
        'workers/main/instancing/Instantiator'
    ],
    function(
        ExpandingPool,
        Instantiator
    ) {

        var count = 0;

        var EffectSpawner = function() {

            count++;

            this.areaGrids = [];

            this.config = {};
            this.plantConfigs = {};

            this.instanceAssetKeys = [];

            this.instantiator = new Instantiator();

            this.plantPools = {};

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

        EffectSpawner.prototype.initEffectSpawner = function(dataId, workerData, onReady) {

            this.workerData = workerData;

            var plantDataReady = function(isUpdate) {
                this.applyPlantConfig(plantsData.data);
                if (!isUpdate) {
                    onReady(this);
                } else {
                    this.resetVegetationSectors();
                }
            }.bind(this);

            var onDataReady = function(isUpdate) {

                this.applyConfig(this.workerData.data);

                if (!isUpdate) {
                    plantsData.fetchData(this.config['area_plants'], plantDataReady);
                    this.setupInstantiator();
                }
                this.resetVegetationSectors();
            }.bind(this);

            workerData.fetchData(dataId, onDataReady);
        };

        EffectSpawner.prototype.applyConfig = function(config) {

            for (var key in config) {
                this.config[key] = config[key];
            }

        };

        EffectSpawner.prototype.applyPlantConfig = function(config) {

            for (var key in config) {
                this.plantConfigs[key] = config[key];
            }

        };


        EffectSpawner.prototype.setupInstantiator = function() {

            var addPlant = function(poolKey, callback) {
                callback(poolKey, new Plant(poolKey, plantActivate, plantDectivate))
            };

            this.instantiator.addInstanceSystem(this.config.asset_id, this.config.sys_key, this.config.asset_id, this.config.pool_size, this.config.render_order);

            var treesCfg = this.config.trees;
            if (treesCfg) {
                for (var i = 0; i < treesCfg.length; i++) {
                    let assetId = treesCfg[i].asset_id
                    this.instanceAssetKeys.push(assetId);
                    this.instantiator.addInstanceSystem(assetId, assetId, assetId, treesCfg[i].pool_size, treesCfg[i].render_order);
                    this.plantPools[assetId] = new ExpandingPool(assetId, addPlant);
                }
            }

            this.plantPools[this.config.asset_id] = new ExpandingPool(this.config.asset_id, addPlant);

            var plantActivate = function(plant) {
                this.activateVegetationPlant(plant)
            }.bind(this);

            var plantDectivate = function(plant) {
                this.deactivateVegetationPlant(plant)
            }.bind(this);

        };


        EffectSpawner.prototype.buildBufferElement = function(poolKey, cb) {
            this.instantiator.buildBufferElement(poolKey, cb)
        };


        EffectSpawner.prototype.addVegetationAtPosition = function(patchConfig, pos, terrainSystem) {

            var area = terrainSystem.getTerrainAreaAtPos(pos);
            var grid = MATH.getFromArrayByKeyValue(this.areaGrids, 'terrainArea', area);
            grid.addPatchToVegetationGrid(patchConfig, pos);

        };



        EffectSpawner.prototype.createEffect = function(assetId, cb, area, parentPlant) {

            var getPlant = function(key, plant) {
                cb(plant, area, parentPlant);
            }.bind(this);

            this.plantPools[assetId].getFromExpandingPool(getPlant)

        };


        EffectSpawner.prototype.activateVegetationPlant = function(plant) {
            this.buildBufferElement(plant.poolKey, plant.getElementCallback())
        };

        EffectSpawner.prototype.deactivateEffect = function(effect) {
            this.instantiator.recoverBufferElement(plant.poolKey, plant.getPlantElement());
            effect.bufferElement = null;
        };

        EffectSpawner.prototype.updateEffectSpawner = function(tpf, time, worldCamera) {
            this.instantiator.updateInstantiatorBuffers();
        };


        EffectSpawner.prototype.resetEffectSpawner = function() {

            var rebuild;

            while (this.areaGrids.length) {
                var areaGrid = this.areaGrids.pop();
                areaGrid.disposeGridSectors();
                if (areaGrid.terrainArea) {
                    rebuild = areaGrid.terrainArea;
                }

            }

            if (rebuild) {
                this.instantiator.updateInstantiatorBuffers();
                this.vegetateTerrainArea(rebuild)
            }

        };


        return EffectSpawner;

    });