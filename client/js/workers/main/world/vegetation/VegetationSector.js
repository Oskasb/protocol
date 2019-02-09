"use strict";

var GuiAPI;

define([
        'workers/main/world/vegetation/SectorContent'
    ],
    function(
        SectorContent
    ) {

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var VegetationSector = function(sectorPlants, activate, deactivate, terrainArea, getPlantConfigs, plantsKey) {

            this.sectorContent = new SectorContent(sectorPlants);
            this.proximityFactor = 1;

            this.terrainArea = terrainArea;

            this.plantsKey = plantsKey;

            this.center = new THREE.Vector3();
            this.origin = new THREE.Vector3();
            this.extents = new THREE.Vector3();



            this.maxPlantCount = sectorPlants;

            this.isActive = false;
            this.isCenterSector = false;



            this.activateCallbacks = [activate];
            this.deactivateCallbacks = [deactivate];


            var addPlant = function(plant, area, parentPlant) {
                this.addPlantToSector(plant, area, parentPlant)
            }.bind(this);


            this.callbacks = {
                addPlant:addPlant,
                getPlantConfigs:getPlantConfigs
            }

        };

        VegetationSector.prototype.setupAsGridSector = function(gridX, gridZ, xMax, zMax) {

            this.sectorSizeX = this.terrainArea.getSizeX()/xMax;
            this.sectorSizeZ = this.terrainArea.getSizeZ()/zMax;
            this.gridX = gridX;
            this.gridZ = gridZ;

            this.setupSctorDimensions();

            tempVec1.x = this.sectorSizeX;
            tempVec1.y = 0;
            tempVec1.z = this.sectorSizeZ;

        };

        VegetationSector.prototype.setupAsPatchSector = function(pos, config) {

            this.sectorSizeX = config.size;
            this.sectorSizeZ = config.size;
            this.gridX = Math.round(pos.x / config.size);
            this.gridZ = Math.round(pos.z / config.size);
            this.setupSctorDimensions();
        };

        VegetationSector.prototype.setupSctorDimensions = function() {

            tempVec1.x = this.sectorSizeX;
            tempVec1.y = 0;
            tempVec1.z = this.sectorSizeZ;

            this.origin.set(this.sectorSizeX * this.gridX, this.terrainArea.center.y, this.sectorSizeZ * this.gridZ);
            this.origin.add(this.terrainArea.getOrigin());
            this.extents.copy(this.getOrigin());
            this.extents.add(tempVec1);
            this.center.copy(tempVec1);
            this.center.multiplyScalar(0.5);
            this.center.add(this.getOrigin())
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

        VegetationSector.prototype.getAppropriatePlantConfig = function(plant) {
            let configs = this.callbacks.getPlantConfigs(this.plantsKey);

            for (var key in configs) {

                let cfg = configs[key];
                if (plant.pos.y > cfg.min_y && plant.pos.y < cfg.max_y) {
                   if (plant.normal.y <= cfg.normal_ymin && plant.normal.y >= cfg.normal_ymax) {
                       candidates.push(cfg);
                   }
                }
            }

            if (candidates.length) {
                let candidate = MATH.getRandomArrayEntry(candidates);
                MATH.emptyArray(candidates);
                return candidate;
            } else {
                this.maxPlantCount--;
            }

        };

        VegetationSector.prototype.positionPlantRandomlyInSector = function(plant) {

            plant.pos.subVectors(this.extents, this.origin);
            plant.pos.x *= Math.random();
            plant.pos.z *= Math.random();
            plant.pos.add(this.origin);

        };

        VegetationSector.prototype.positionPlantRandomlyNearParentPlant = function(plant, parentPlant, compCfv) {

            plant.pos.set(0, 0, 0);
            tempVec1.set(1 , 0,1  )

            MATH.spreadVector(plant.pos, tempVec1);
            plant.pos.normalize();
            let dst = MATH.randomBetween(compCfv.dst_min || 1, compCfv.dst_max || 2);
            plant.pos.multiplyScalar(0.25 + parentPlant.size * 0.001 * dst);
            plant.pos.add(parentPlant.pos);
        };


        VegetationSector.prototype.addPlantToSector = function(plant, area, parentPlant) {



                this.positionPlantRandomlyInSector(plant);
                plant.pos.y = area.getHeightAndNormalForPos(plant.pos, plant.normal);
                let cfg = this.getAppropriatePlantConfig(plant);
                if (!cfg) return;

            plant.applyPlantConfig(cfg);

            this.sectorContent.addInactivePlant(plant);

            if (plant.config['patch']) {
                MainWorldAPI.getWorldSimulation().addVegetationPatch(plant.config['patch'], plant.pos)
            }

        };


        VegetationSector.prototype.activateSectorPlants = function(count) {
            this.sectorContent.activatePlantCount(count);
        };

        VegetationSector.prototype.deactivateSectorPlantCount = function(count) {
            this.sectorContent.deactivatePlantCount(count);
        };

        VegetationSector.prototype.deactivateSectorPlants = function() {
            this.sectorContent.deactivateAllPlants();
        };


        VegetationSector.prototype.updateProximityStatus = function(proximityFactor) {
            if (this.proximityFactor === proximityFactor) return;
            this.proximityFactor = proximityFactor;
            this.enableMissingPlants();
        };

        VegetationSector.prototype.getMissingPlantCount = function() {
            return Math.floor(this.maxPlantCount * this.proximityFactor) - this.sectorContent.getActivePlantCount();
        };

        VegetationSector.prototype.enableMissingPlants = function() {

            let missingPlants = this.getMissingPlantCount();

            if (missingPlants > 0) {
                MATH.callAll(this.activateCallbacks, this, missingPlants);
                this.activateSectorPlants(missingPlants);
            }

            if (missingPlants < 0) {
                this.deactivateSectorPlantCount(-missingPlants );
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