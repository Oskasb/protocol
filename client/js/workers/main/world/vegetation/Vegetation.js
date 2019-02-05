"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'workers/main/instancing/Instantiator',
        'workers/main/world/vegetation/Plant',
    ],
    function(
        ExpandingPool,
        Instantiator,
        Plant
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

            this.config = {};
            for (var key in configDefault) {
                this.config[key] = config[key] || configDefault[key];
            }

            this.instantiator = new Instantiator();
            this.elementKey = this.config.sysKey+count;
            this.instantiator.addInstanceSystem(this.elementKey, this.config.sys_key, this.config.asset_id, this.config.pool_size, this.config.render_order)

            var addPlant = function(poolKey, callback) {
                callback(poolKey, new Plant())
            };

            this.expandingPool = new ExpandingPool(this.elementKey, addPlant);

        };


        Vegetation.prototype.buildBufferElement = function(cb) {
            this.instantiator.buildBufferElement(this.elementKey, cb)
        };



        Vegetation.prototype.addVegetationAtPosition = function(pos, terrainSystem) {

            var getPlant = function(key, plant) {
                plant.setPlantPosition(pos);
                var area = terrainSystem.getTerrainAreaAtPos(pos);
                plant.pos.y = area.getHeightAndNormalForPos(plant.pos, plant.normal);
                this.buildBufferElement(plant.getElementCallback())
            }.bind(this);

            this.expandingPool.getFromExpandingPool(getPlant)

        };


        Vegetation.prototype.updateVegetation = function(tpf, time) {
            this.instantiator.updateInstantiatorBuffers();
        };

        return Vegetation;

    });