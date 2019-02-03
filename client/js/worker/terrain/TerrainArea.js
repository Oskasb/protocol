"use strict";

define([
        'worker/terrain/AreaFunctions'
    ],
    function(
        AreaFunctions
    ) {

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();
        var tempObj3d = new THREE.Object3D();

        var TerrainArea = function(terrainFunctions, x, z) {

            this.x = x || 0;
            this.z = z || 0;

            this.areaFunctions = new AreaFunctions(terrainFunctions);
            this.areaFunctions.setTerrainArea(this);

            this.origin = new THREE.Vector3();
            this.extents = new THREE.Vector3();
            this.center = new THREE.Vector3();
            this.boundingBox = new THREE.Box3();

            GuiAPI.printDebugText("GENRATE TERRAIN");

            this.terrain = terrainFunctions.createTerrain();

            this.setTerrainOptions(this.terrain.options);

            this.buffers = terrainFunctions.getTerrainBuffers(this.terrain);

            this.terrain.array1d = this.buffers[4];

            GuiAPI.printDebugText("TERRAIN BUFFERS READY");

            var requestAssetMessage = [ENUMS.Message.TERRAIN_BUFFERS, {buffers:this.buffers, pos:[this.origin.x, this.origin.y, this.origin.z]}];

            MainWorldAPI.postToRender(requestAssetMessage)

        };

        TerrainArea.prototype.configRead = function(dataKey) {

        };

        TerrainArea.prototype.setTerrainOptions = function(options) {
            this.terrainOptions = options;

            this.size = this.terrainOptions.terrain_size;
            this.setTerrainPosXYZ(this.x - this.size / 2, this.terrainOptions.min_height, this.z - this.size / 2);
            this.setTerrainExtentsXYZ(this.size, this.terrainOptions.max_height - this.terrainOptions.min_height, this.size);

            this.boundingBox.min.copy(this.origin);
            this.boundingBox.max.addVectors(this.origin, this.extents);
            console.log(this)

        };

        TerrainArea.prototype.setTerrainPosXYZ = function(x, y, z) {
            this.origin.x = x;
            this.origin.y = y;
            this.origin.z = z;
            this.updateCenter();
        };

        TerrainArea.prototype.getTerrainVegetationSystemId = function() {
            return this.terrainOptions.vegetation_system;
        };


        TerrainArea.prototype.getTerrain = function() {
            return this.terrain;
        };

        TerrainArea.prototype.getOrigin = function() {
            return this.origin;
        };

        TerrainArea.prototype.getExtents = function() {
            return this.extents;
        };

        TerrainArea.prototype.updateCenter = function() {
            this.center.copy(this.extents);
            this.center.multiplyScalar(0.5);
            this.center.addVectors(this.origin, this.center);
        };

        TerrainArea.prototype.positionIsWithin = function(pos) {
            if (pos.x > this.origin.x && pos.x < this.extents.x + this.origin.x && pos.z > this.origin.z && pos.z < this.extents.z + this.origin.z) {
                return true
            }
        };

        TerrainArea.prototype.getHeightAndNormalForPos = function(pos, norm) {
                return this.areaFunctions.getHeightAtPos(pos, norm);
        };

        TerrainArea.prototype.setTerrainExtentsXYZ = function(x, y, z) {
            this.extents.x = x;
            this.extents.y = y;
            this.extents.z = z;
            this.updateCenter();
        };

        TerrainArea.prototype.getRandomPointOnTerrain = function(posStore, normStore, minHeight, maxHeight) {

            posStore.copy(this.origin);
            posStore.x += Math.random()*this.extents.x;
            posStore.z += Math.random()*this.extents.z;
            posStore.y = this.getHeightAndNormalForPos(posStore, normStore);

            if (posStore.y < minHeight || posStore.y > maxHeight) {
                GuiAPI.printDebugText("POINT OUTSIDE BOUNTS "+Math.round(posStore.y));
                this.getRandomPointOnTerrain(posStore, normStore, minHeight, maxHeight);
            }

        };

        TerrainArea.prototype.applyStaticTerrainData = function(msg) {

        };

        TerrainArea.prototype.createAreaOfTerrain = function(posx, posz) {

        };


        TerrainArea.prototype.generateTerrainSectons = function(density) {

        };


        TerrainArea.prototype.updateTerrainArea = function(tpf) {

        };

        return TerrainArea;

    });

