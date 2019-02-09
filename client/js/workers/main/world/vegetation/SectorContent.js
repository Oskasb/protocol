"use strict";

var GuiAPI;

define([

    ],
    function(

    ) {

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var SectorContent = function(targetCount) {

            this.targetPlantCount = targetCount;

            this.inactivePlants = [];
            this.plants = [];
            this.addedPlantsCount = 0;

        };

        SectorContent.prototype.getActivePlantCount = function() {
            return this.plants.length;
        };

        SectorContent.prototype.getInactivePlants = function() {
            return this.inactivePlants;
        };


        SectorContent.prototype.addInactivePlant = function(plant) {
            this.addedPlantsCount++;
            this.inactivePlants.push(plant);
        };


        SectorContent.prototype.activatePlantCount = function(count) {
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

        SectorContent.prototype.deactivatePlantCount = function(count) {

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

        SectorContent.prototype.deactivateAllPlants = function() {
            while (this.plants.length) {
                var plant = this.plants.pop();
                plant.plantDeactivate();
                this.inactivePlants.push(plant);
            }
        };

        return SectorContent;

    });