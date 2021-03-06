"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'workers/main/instancing/Instantiator',
        'workers/main/world/vegetation/Plant',
        'workers/main/world/vegetation/VegetationGrid'
    ],
    function(
        ExpandingPool,
        Instantiator,
        Plant,
        VegetationGrid
    ) {

        var configDefault = {
            "sys_key": "VEG_8x8",
            "asset_id":  "asset_vegQuad",
            "pool_size": 6000,
            "render_order": 0
        };

        var count = 0;

        var Vegetation = function() {

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

        Vegetation.prototype.initVegetation = function(dataId, workerData, plantsData, onReady) {

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

        Vegetation.prototype.applyConfig = function(config) {

            for (var key in config) {
                this.config[key] = config[key];
            }

        };

        Vegetation.prototype.applyPlantConfig = function(config) {

            for (var key in config) {
                this.plantConfigs[key] = config[key];
            }

        };


        Vegetation.prototype.setupInstantiator = function() {

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


        Vegetation.prototype.buildBufferElement = function(poolKey, cb) {
            this.instantiator.buildBufferElement(poolKey, cb)
        };


        Vegetation.prototype.addVegetationAtPosition = function(patchConfig, pos, terrainSystem) {

            var area = terrainSystem.getTerrainAreaAtPos(pos);
            var grid = MATH.getFromArrayByKeyValue(this.areaGrids, 'terrainArea', area);
            grid.addPatchToVegetationGrid(patchConfig, pos);

        };



        Vegetation.prototype.createPlant = function(assetId, cb, area, parentPlant) {

            var getPlant = function(key, plant) {
                cb(plant, area, parentPlant);
            }.bind(this);

            this.plantPools[assetId].getFromExpandingPool(getPlant)

        };

        Vegetation.prototype.vegetateTerrainArea = function(area) {

            var grid = new VegetationGrid(area, this.callbacks.populateSector, this.callbacks.depopulateSector, this.callbacks.getPlantConfigs, 'plants');
            this.areaGrids.push(grid);

            grid.generateGridSectors(this.config.sector_plants, this.config.grid_range, this.config.area_sectors[0], this.config.area_sectors[1]);

            if (this.config.trees) {
                var treeGrid = new VegetationGrid(area, this.callbacks.populateSector, this.callbacks.depopulateSector, this.callbacks.getPlantConfigs, 'trees');
                treeGrid.generateGridSectors(this.config.sector_trees, this.config.tree_Sector_range, this.config.tree_sectors[0], this.config.tree_sectors[1]);
            }
            this.areaGrids.push(treeGrid);
        };

        Vegetation.prototype.activateVegetationPlant = function(plant) {
            this.buildBufferElement(plant.poolKey, plant.getElementCallback())
        };

        Vegetation.prototype.deactivateVegetationPlant = function(plant) {
            this.instantiator.recoverBufferElement(plant.poolKey, plant.getPlantElement());
            plant.bufferElement = null;
        };

        Vegetation.prototype.populateVegetationSector = function(sector, area, plantCount, parentPlant) {
        //    "asset_vegQuad" gets replaced when instancing buffer is fetched.. redundant maybe...
            for (var i = 0; i < plantCount; i++) {
                this.createPlant("asset_vegQuad", sector.getAddPlantCallback(), area, parentPlant);
            }
        };


        Vegetation.prototype.depopulateVegetationSector = function(sector) {
            sector.deactivateSectorPlants();
        };

        Vegetation.prototype.updateVegetation = function(tpf, time, worldCamera) {
            for (var i = 0; i < this.areaGrids.length; i++) {
                this.areaGrids[i].updateVegetationGrid(tpf, time, worldCamera)
            }

            this.instantiator.updateInstantiatorBuffers();
        };


        Vegetation.prototype.resetVegetationSectors = function() {

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


        return Vegetation;

    });