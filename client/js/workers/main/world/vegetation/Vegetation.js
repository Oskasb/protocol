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

        var Vegetation = function(config) {

            config = config || {};

            count++;

            this.areaGrids = [];

            this.config = {};
            for (var key in configDefault) {
                this.config[key] = config[key] || configDefault[key];
            }

            this.instantiator = new Instantiator();
            this.elementKey = this.config.sys_key+count;
            this.instantiator.addInstanceSystem(this.elementKey, this.config.sys_key, this.config.asset_id, this.config.pool_size, this.config.render_order)

            var addPlant = function(poolKey, callback) {
                callback(poolKey, new Plant(plantActivate, plantDectivate))
            };

            this.expandingPool = new ExpandingPool(this.elementKey, addPlant);

            var populateSector = function(sector, area, plantCount) {
                this.populateVegetationSector(sector, area, plantCount)
            }.bind(this);

            var depopulateSector = function(sector, area) {
                this.depopulateVegetationSector(sector, area)
            }.bind(this);

            var plantActivate = function(plant) {
                this.activateVegetationPlant(plant)
            }.bind(this);

            var plantDectivate = function(plant) {
                this.deactivateVegetationPlant(plant)
            }.bind(this);

            this.callbacks = {
                populateSector:populateSector,
                depopulateSector:depopulateSector
            }

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
            var grid = new VegetationGrid(area, this.callbacks.populateSector, this.callbacks.depopulateSector)
            this.areaGrids.push(grid);
            grid.generateGridSectors(100, 100);
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

        return Vegetation;

    });