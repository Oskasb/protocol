"use strict";

define([
        'game/equipment/EquipmentSlot',
    ],
    function(
        EquipmentSlot
    ) {

        var EquipmentSlots = function() {
            this.slots = [];
        };

        EquipmentSlots.prototype.initEquipmentSlots = function( dataId, workerData, onReady) {

            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    this.addEquipmentSlots();
                    onReady(this);
                }
            }.bind(this);

            workerData.fetchData(dataId, onDataReady);
        };

        EquipmentSlots.prototype.addEquipmentSlots = function() {
            var slots = this.readConfigData('slots');

            for (var i = 0; i < slots.length; i++) {
                this.slots.push(new EquipmentSlot(slots[i]['slot_id'], slots[i]['joint']))
            }

        };

        EquipmentSlots.prototype.getEquipmentSlotForItem = function(item) {

            for (var i = 0; i < this.slots.length; i++) {
                if (this.slots[i].isSuitableForItem(item)){
                    return this.slots[i]
                }
            }

        };

        EquipmentSlots.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };


        return EquipmentSlots;


    });

