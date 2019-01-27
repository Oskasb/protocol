"use strict";

define([

    ],
    function(

    ) {

        var EquipmentSlot = function(slotId, joint) {
            this.slotId = slotId;
            this.joint = joint;
            console.log("new Slot", slotId, joint);
        };

        EquipmentSlot.prototype.initEquipmentSlots = function( dataId, workerData, onReady) {

            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);

            workerData.fetchData(dataId, onDataReady);
        };

        EquipmentSlot.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        EquipmentSlot.prototype.isSuitableForItem = function(item) {

            console.log("Test suitability", this, item)

            if (this.slotId === 'SLOT_HAND_R') {
                return true
            }


        };



        return EquipmentSlot;


    });

