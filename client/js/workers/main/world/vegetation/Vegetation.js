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

            this.instantiator = new Instantiator();

            var populateSector = function(sector, area, plantCount) {
                this.populateVegetationSector(sector, area, plantCount)
            }.bind(this);

            var depopulateSector = function(sector, area) {
                this.depopulateVegetationSector(sector, area)
            }.bind(this);

            var getPlantConfigs = function() {
                return this.plantConfig
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

        Vegetation.prototype.setupInstantiator = function() {

            this.elementKey = this.config.sys_key+count;
            this.instantiator.addInstanceSystem(this.elementKey, this.config.sys_key, this.config.asset_id, this.config.pool_size, this.config.render_order);

            var addPlant = function(poolKey, callback) {
                callback(poolKey, new Plant(plantActivate, plantDectivate))
            };

            this.expandingPool = new ExpandingPool(this.elementKey, addPlant);

            var plantActivate = function(plant) {
                this.activateVegetationPlant(plant)
            }.bind(this);

            var plantDectivate = function(plant) {
                this.deactivateVegetationPlant(plant)
            }.bind(this);

        };

        Vegetation.prototype.buildBufferElement = function(cb) {
            this.instantiator.buildBufferElement(this.elementKey, cb)
        };



        Vegetation.prototype.addVegetationAtPosition = function(pos, terrainSystem) {

            var getPlant = function(key, plant) {
                plant.setPlantPosition(pos);
                var area = terrainSystem.getTerrainAreaAtPos(pos);
                plant.pos.y = area.getHeightAndNormalForPos(plant.pos, plant.normal);
                plant.plantActivate()
            }.bind(this);

            this.expandingPool.getFromExpandingPool(getPlant)

        };

        Vegetation.prototype.createPlant = function(cb, area) {

            var getPlant = function(key, plant) {
                cb(plant, area);
            }.bind(this);

            this.expandingPool.getFromExpandingPool(getPlant)

        };

        Vegetation.prototype.vegetateTerrainArea = function(area) {

            var grid = new VegetationGrid(area, this.callbacks.populateSector, this.callbacks.depopulateSector, this.callbacks.getPlantConfigs);
            this.areaGrids.push(grid);

            grid.generateGridSectors(this.config.sector_plants, this.config.grid_range, this.config.area_sectors[0], this.config.area_sectors[1]);


        };

        Vegetation.prototype.activateVegetationPlant = function(plant) {
            this.buildBufferElement(plant.getElementCallback())
        };

        Vegetation.prototype.deactivateVegetationPlant = function(plant) {
            this.instantiator.recoverBufferElement(this.elementKey, plant.getPlantElement());
            plant.bufferElement = null;
        };

        Vegetation.prototype.populateVegetationSector = function(sector, area, plantCount) {

        //    console.log("Pop", plantCount)
            for (var i = 0; i < plantCount; i++) {
                this.createPlant(sector.getAddPlantCallback(), area);
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

            while (rebuild.length) {
                this.vegetateTerrainArea(rebuild.pop())
            }

        };


        return Vegetation;

    });