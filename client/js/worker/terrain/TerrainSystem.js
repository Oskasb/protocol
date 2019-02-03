"use strict";

define([

        'worker/terrain/TerrainFunctions',
        'worker/terrain/TerrainArea'
    ],
    function(

        TerrainFunctions,
        TerrainArea
    ) {

        var tempVec = new THREE.Vector3();

        var scatter = 0;

        var gridSpacing = 2000;
        var gridWidth = 2;
        var minX = 1000;
        var minZ = 1000;

        var spawnCount = 0;
        var row = 0;
        var col = 0;

        var TerrainSystem = function() {
            this.terrainFunctions = new TerrainFunctions();
            this.terrainAreas = [];
        };

        var gridPosX = function() {
            row = MATH.moduloPositive(spawnCount, gridWidth);
            return minX + row*gridSpacing + Math.random()*scatter
        };

        var gridPosZ = function() {
            col = Math.floor(spawnCount / gridWidth);
            return minZ + col*gridSpacing+ Math.random()*scatter
        };

        TerrainSystem.prototype.initTerrainSystem = function() {


        };

        TerrainSystem.prototype.generateTerrainArea = function() {
            this.terrainAreas.push(new TerrainArea(this.terrainFunctions))

        };


        TerrainSystem.prototype.getTerrainHeightAndNormal = function(pos, normalStore) {

            for (var i = 0; i < this.terrainAreas.length; i++) {
                if (this.terrainAreas[i].positionIsWithin(pos)) {
                    return this.terrainAreas[i].getHeightAndNormalForPos(pos, normalStore)
                }
            }
        };

        TerrainSystem.prototype.getTerrainAreaAtPos = function(pos) {

            for (var i = 0; i < this.terrainAreas.length; i++) {
                if (this.terrainAreas[i].positionIsWithin(pos)) {
                    return this.terrainAreas[i];
                }
            }
        };

        return TerrainSystem;

    });

