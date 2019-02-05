"use strict";

var GuiAPI;

define([

    ],
    function(

    ) {

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var VegetationSector = function(gridX, gridZ, xMax, zMax, sectorPlants, activate, deactivate, terrainArea, getPlantConfigs) {

            this.gridX = gridX;
            this.gridZ = gridZ;

            this.center = new THREE.Vector3();
            this.origin = new THREE.Vector3();
            this.extents = new THREE.Vector3();


            this.sectorSizeX = terrainArea.getSizeX()/xMax;
            this.sectorSizeZ = terrainArea.getSizeZ()/zMax;

            this.inactivePlants = [];
            this.plants = [];

            this.maxPlantCount = sectorPlants;

            this.isActive = false;
            this.isCenterSector = false;

            this.proximityFactor = 1;

            this.activateCallbacks = [activate];
            this.deactivateCallbacks = [deactivate];

            tempVec1.x = this.sectorSizeX;
            tempVec1.y = 0;
            tempVec1.z = this.sectorSizeZ;


            this.origin.set(this.sectorSizeX * gridX, terrainArea.center.y, this.sectorSizeZ * gridZ);
            this.origin.add(terrainArea.getOrigin());
            this.extents.copy(this.getOrigin());
            this.extents.add(tempVec1);
            this.center.copy(tempVec1);
            this.center.multiplyScalar(0.5);
            this.center.add(this.getOrigin())


            var addPlant = function(plant, area) {
                this.addPlantToSector(plant, area)
            }.bind(this);


            this.callbacks = {
                addPlant:addPlant,
                getPlantConfigs:getPlantConfigs
            }

        };


        VegetationSector.prototype.getCenter = function() {
            return this.center;
        };

        VegetationSector.prototype.getOrigin = function() {
            return this.origin;
        };

        VegetationSector.prototype.getExtents = function() {
            return this.extents;
        };

        VegetationSector.prototype.getIsActive = function() {
            return this.isActive;
        };

        VegetationSector.prototype.getIsCenterSector = function() {
            return  this.isCenterSector;
        };

        VegetationSector.prototype.setIsCenterSector = function(bool) {
            this.isCenterSector = bool;
        };

        VegetationSector.prototype.getAddPlantCallback = function() {
            return this.callbacks.addPlant;
        };


        var candidates = [];

        VegetationSector.prototype.applyAppropriatePlantConfig = function(plant) {
            let configs = this.callbacks.getPlantConfigs();

            for (var key in configs) {

                let cfg = configs[key];
                if (plant.pos.y > cfg.min_y && plant.pos.y < cfg.max_y) {
                   if (plant.normal.y <= cfg.normal_ymin && plant.normal.y >= cfg.normal_ymax) {
                       candidates.push(cfg);
                   }
                }

            }

            if (candidates.length) {
                plant.applyPlantConfig(MATH.getRandomArrayEntry(candidates));
                this.inactivePlants.push(plant);
                MATH.emptyArray(candidates);
            } else {
                this.maxPlantCount--;
            }


        };

        VegetationSector.prototype.addPlantToSector = function(plant, area) {

            plant.pos.subVectors(this.extents, this.origin);

            plant.pos.x *= Math.random();
            plant.pos.z *= Math.random();

            plant.pos.add(this.origin);
            plant.pos.y = area.getHeightAndNormalForPos(plant.pos, plant.normal)

            this.applyAppropriatePlantConfig(plant);

        };


        VegetationSector.prototype.activateSectorPlants = function(count) {
            while (this.inactivePlants.length) {

                var plant = this.inactivePlants.pop();
                plant.plantActivate();
                this.plants.push(plant);

                count--;
                if (count === 0) {
                    break;
                }

            }
        };

        VegetationSector.prototype.deactivateSectorPlantCount = function(count) {

            for (var i = 0; i < count; i++) {
                let plant = this.plants.pop();
                if (!plant) {
                    console.log("Bad plant copunt");
                    return;
                }
                plant.plantDeactivate();
                this.inactivePlants.push(plant);
            }

        };

        VegetationSector.prototype.deactivateSectorPlants = function() {
            for (var i = 0; i < this.plants.length; i++) {
                this.plants[i].plantDeactivate();
            }
        };


        VegetationSector.prototype.updateProximityStatus = function(proximityFactor) {
            if (this.proximityFactor === proximityFactor) return;
            this.proximityFactor = proximityFactor;
            this.enableMissingPlants();
        };

        VegetationSector.prototype.getMissingPlantCount = function() {
            return Math.floor(this.maxPlantCount * this.proximityFactor) - this.plants.length;
        };

        VegetationSector.prototype.enableMissingPlants = function() {

            let missingPlants = this.getMissingPlantCount();

            if (missingPlants > 0) {
                MATH.callAll(this.activateCallbacks, this, missingPlants);
                this.activateSectorPlants(missingPlants);
            }

            if (missingPlants < 0) {
                this.deactivateSectorPlantCount(-missingPlants);
            }

        };


        VegetationSector.prototype.activateVegetationSector = function() {
            this.isActive = true;
        };

        VegetationSector.prototype.deactivateVegetationSector = function() {
            this.isActive = false;
            MATH.callAll(this.deactivateCallbacks, this);
        };


        return VegetationSector;

    });