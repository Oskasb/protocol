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
            "pool_size": 15000,
            "render_order": 0
        };

        var count = 0;

        var Vegetation = function() {

            count++;

            this.areaGrids = [];

            this.config = {};
            this.plantConfig = {};
            this.treeConfig = {};

            this.instanceAssetKeys = [];

            this.instantiator = new Instantiator();

            this.plantPools = {};

            var populateSector = function(sector, area, plantCount) {
                this.populateVegetationSector(sector, area, plantCount)
            }.bind(this);

            var depopulateSector = function(sector, area) {
                this.depopulateVegetationSector(sector, area)
            }.bind(this);

            var getPlantConfigs = function() {
                return this.plantConfig
            }.bind(this);

            var getTreesConfigs = function() {
                return this.treeConfig
            }.bind(this);

            this.callbacks = {
                populateSector:populateSector,
                depopulateSector:depopulateSector,
                getPlantConfigs:getPlantConfigs,
                getTreesConfigs:getTreesConfigs
            }

        };

        Vegetation.prototype.initVegetation = function(dataId, workerData, plantsData, onReady) {

            this.workerData = workerData;


            var plantDataReady = function(isUpdate) {
                this.applyTreeConfig(plantsData.data.trees);
                this.applyPlantConfig(plantsData.data.plants);
                if (!isUpdate) {
                    onReady(this);
                }

            }.bind(this);


            var onDataReady = function(isUpdate) {

                this.applyConfig(this.workerData.data);

                if (!isUpdate) {
                    plantsData.fetchData(this.config['area_plants'], plantDataReady);
                    this.setupInstantiator();
                }

            }.bind(this);

            workerData.fetchData(dataId, onDataReady);

        };

        Vegetation.prototype.applyConfig = function(config) {

            for (var key in config) {
                this.config[key] = config[key];
            }
            this.resetVegetationSectors();
        };

        Vegetation.prototype.applyPlantConfig = function(config) {

            for (var key in config) {
                this.plantConfig[key] = config[key];
            }

            this.resetVegetationSectors();

        };

        Vegetation.prototype.applyTreeConfig = function(config) {

            for (var key in config) {
                this.treeConfig[key] = config[key];
            }

        //    this.resetVegetationSectors();

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


        Vegetation.prototype.addVegetationAtPosition = function(pos, terrainSystem) {

            var getPlant = function(key, plant) {
                plant.setPlantPosition(pos);
                var area = terrainSystem.getTerrainAreaAtPos(pos);
                plant.pos.y = area.getHeightAndNormalForPos(plant.pos, plant.normal);
                plant.applyPlantConfig(plant.config)
                plant.plantActivate()
            }.bind(this);

            this.plantPools["asset_vegQuad"].getFromExpandingPool(getPlant)

        };

        Vegetation.prototype.createPlant = function(assetId, cb, area) {

            var getPlant = function(key, plant) {
                cb(plant, area);
            }.bind(this);

            this.plantPools[assetId].getFromExpandingPool(getPlant)

        };

        Vegetation.prototype.vegetateTerrainArea = function(area) {

            var grid = new VegetationGrid(area, this.callbacks.populateSector, this.callbacks.depopulateSector, this.callbacks.getPlantConfigs);
            this.areaGrids.push(grid);

            grid.generateGridSectors(this.config.sector_plants, this.config.grid_range, this.config.area_sectors[0], this.config.area_sectors[1]);

            if (this.config.trees) {
                var treeGrid = new VegetationGrid(area, this.callbacks.populateSector, this.callbacks.depopulateSector, this.callbacks.getTreesConfigs);
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

        Vegetation.prototype.populateVegetationSector = function(sector, area, plantCount, assetId) {

            assetId = assetId || "asset_vegQuad";

        //    console.log("Pop", plantCount)
            for (var i = 0; i < plantCount; i++) {
                this.createPlant(assetId, sector.getAddPlantCallback(), area);
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

            var rebuild = [];

            while (this.areaGrids.length) {
                var areaGrid = this.areaGrids.pop();
                areaGrid.disposeGridSectors();
                rebuild.push(areaGrid.terrainArea);
            }

            this.instantiator.updateInstantiatorBuffers();

            var _this = this;

            while (rebuild.length) {
                _this.vegetateTerrainArea(rebuild.pop())
            }

        };


        return Vegetation;

    });