"use strict";

var GuiAPI;

define([
        'workers/main/world/vegetation/VegetationSector'
    ],
    function(
        VegetationSector
    ) {

        var tempVec1 = new THREE.Vector3();

        var VegetationGrid = function(terrainArea, populateSector, depopulateSector, getPlantConfigs, plantsKey) {
            this.activeGridRange = 8;
            this.terrainArea = terrainArea;

            this.plantsKey = plantsKey;

            this.lastUpdatedCenterPos = new THREE.Vector3();

            this.sectors = [];

            this.populateCallbacks = [populateSector];
            this.depopulateCallbacks = [depopulateSector];

            this.centerSector = null;
            this.activeSectors = [];

            this.vegetationPatches = [];
            this.activePatches = [];

            var sectorActivate = function(sector, plantCount, parentPlant) {
                this.gridSectorActivate(sector, plantCount, parentPlant);
            }.bind(this);

            var sectorDeactivate = function(sector) {
                this.gridSectorDeactivate(sector);
            }.bind(this);

            this.callbacks = {
                sectorActivate:sectorActivate,
                sectorDeactivate:sectorDeactivate,
                getPlantConfigs:getPlantConfigs
            }
        };

        VegetationGrid.prototype.generateGridSectors = function(sectorPlants, gridRange, sectorsX, sectorsZ) {
            this.activeGridRange = gridRange;
            for (var i = 0; i < sectorsX; i++) {
                this.sectors[i] = [];
                for (var j = 0; j < sectorsZ; j++) {
                    let sector = new VegetationSector(sectorPlants, this.callbacks.sectorActivate, this.callbacks.sectorDeactivate, this.terrainArea, this.callbacks.getPlantConfigs, this.plantsKey)
                    sector.setupAsGridSector(i, j, sectorsX, sectorsZ);
                    this.sectors[i].push(sector)
                }
            }
        };



        VegetationGrid.prototype.gridSectorActivate = function(sector, plantCount, parentPlant) {
            MATH.callAll(this.populateCallbacks, sector, this.terrainArea, plantCount, parentPlant)
        };

        VegetationGrid.prototype.gridSectorDeactivate = function(sector) {
            MATH.callAll(this.depopulateCallbacks, sector, this.terrainArea)
        };

        VegetationGrid.prototype.addPatchToVegetationGrid = function(patchConfig, pos) {

            let config = this.callbacks.getPlantConfigs('patches')[patchConfig];
        //    console.log("PatchCfg:", config);

            var plantCount = Math.round(MATH.randomBetween(config.plants_min, config.plants_max));

            if (config['plants']) {
                let sector = new VegetationSector(plantCount, this.callbacks.sectorActivate, this.callbacks.sectorDeactivate, this.terrainArea, this.callbacks.getPlantConfigs, 'plants');
                sector.setupAsPatchSector(pos, config);
                sector.activateVegetationSector();
                this.vegetationPatches.push(sector);
            }

        };


        VegetationGrid.prototype.getSectorAtPosition = function(pos) {

            tempVec1.copy(pos);
            tempVec1.sub(this.terrainArea.getOrigin());

            let rows = this.sectors.length;
            let rowSize = this.terrainArea.getSizeX() / rows;
            let row = tempVec1.x / rowSize;
            tempVec1.x = Math.floor(row) ;

            let cols = this.sectors[tempVec1.x].length;
            let colSize = this.terrainArea.getSizeZ() / cols;
            let col = tempVec1.z / colSize;

            tempVec1.z = Math.floor(col );

            return this.sectors[tempVec1.x][tempVec1.z];
        };

        var clears = [];

        VegetationGrid.prototype.activateNeighboringSectors = function(centerSector) {

            var range = Math.ceil((this.activeGridRange / this.sectors.length) * centerSector.sectorSizeX) ;
            var row;
            var col;
            var sector;

            while (this.activeSectors.length) {
                clears.push(this.activeSectors.pop());
            }

            for (var i = -range; i < range; i++) {
                row = centerSector.gridX + i;
                if (this.sectors[row]) {

                    for (var j = -range; j < range; j++) {

                        col = centerSector.gridZ + j;
                        sector = this.sectors[row][col];

                        if (sector) {
                            if (!sector.getIsActive()) {
                                sector.activateVegetationSector();
                            }
                            if (clears.indexOf(sector) !== -1) {
                                MATH.quickSplice(clears, sector);
                            }
                            this.activeSectors.push(sector);
                        }
                    }
                }
            }

            while (clears.length) {
                clears.pop().deactivateVegetationSector();
            }

        };


        VegetationGrid.prototype.centerSectorChanged = function(sector) {

            if (this.centerSector) {
                this.centerSector.setIsCenterSector(false)
            }

            sector.setIsCenterSector(true);
            this.centerSector = sector;
            this.activateNeighboringSectors(sector);
        };

        var centerSector;

        VegetationGrid.prototype.calcDistanceFromCenter = function(sector, centerPos) {

            tempVec1.copy(centerPos);
            tempVec1.y = sector.center.y;

            let dst = Math.max(tempVec1.distanceTo(sector.center), 0);
            dst = (dst / this.activeGridRange);
        //    console.log(dx, dz);
            return MATH.clamp(MATH.curveSigmoid(1.2 - MATH.curveSqrt(dst*2.5), 0, 1))//+dz

        };

        VegetationGrid.prototype.updateGridProximity = function(centerPos) {


            for (var i = 0; i < this.activeSectors.length; i++) {

                let distance = this.calcDistanceFromCenter(this.activeSectors[i], centerPos);
                this.activeSectors[i].updateProximityStatus(distance);

            }


            for (var i = 0; i < this.vegetationPatches.length; i++) {


            //    if (Math.random() < 0.1) {
                    let distance = this.calcDistanceFromCenter(this.vegetationPatches[i], centerPos);
                    this.vegetationPatches[i].updateProximityStatus(distance);
            //    }

            }

        };

        VegetationGrid.prototype.updateCenterSectorAtPosition = function(worldCamera) {

            let centerPos = worldCamera.getCameraLookAt();


            if (this.lastUpdatedCenterPos.distanceToSquared(centerPos) < 1) {
                return;
            }
            this.lastUpdatedCenterPos.copy(centerPos);

            centerSector = this.getSectorAtPosition(centerPos);

            if (centerSector) {

                if (!centerSector.getIsCenterSector()) {
                    this.centerSectorChanged(centerSector);
                }

                this.updateGridProximity(centerPos);
            }

        };

        VegetationGrid.prototype.updateVegetationGrid = function(tpf, time, worldCamera) {

            this.updateCenterSectorAtPosition(worldCamera);

        };

        VegetationGrid.prototype.disposeGridSectors = function() {

            while (this.activeSectors.length) {
                this.activeSectors.pop().deactivateVegetationSector();
            }

            while (this.vegetationPatches.length) {
                this.vegetationPatches.pop().deactivateVegetationSector();
            }

            while (this.sectors.length) {
                this.sectors.pop();
            }

        };

        return VegetationGrid;

    });