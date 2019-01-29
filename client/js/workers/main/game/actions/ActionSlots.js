"use strict";

define([
        'game/actions/ActionSlot',
    ],
    function(
        ActionSlot
    ) {

        var ActionSlots = function() {
            this.slots = [];
        };

        ActionSlots.prototype.initActionSlots = function( dataId, workerData, onReady) {

            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    this.addActionSlot();
                    onReady(this);
                }
            }.bind(this);

            workerData.fetchData(dataId, onDataReady);
        };

        ActionSlots.prototype.addActionSlot = function() {
            var slots = this.readConfigData('slots');

            for (var i = 0; i < slots.length; i++) {
                this.slots.push(new ActionSlot(slots[i]['slot_id'], i, slots[i]['x'], slots[i]['y']))
            }
        };

        ActionSlots.prototype.getAvailableActionSlot = function(action) {


            for (var i = 0; i < this.slots.length; i++) {
                if (this.slots[i].isSuitableForAction(action)){
                    return this.slots[i]
                }
            }
        };

        ActionSlots.prototype.getReadyActionSlot = function() {

            for (var i = 0; i < this.slots.length; i++) {
                if (this.slots[i].isReadyForActivation()){
                    return this.slots[i];
                }
            }
        };

        ActionSlots.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };


        return ActionSlots;


    });

