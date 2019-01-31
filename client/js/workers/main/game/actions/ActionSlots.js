"use strict";

define([
        'game/actions/ActionSlot',
    ],
    function(
        ActionSlot
    ) {

        var ActionSlots = function() {
            this.slots = [];

            this.requestActivationCallbacks = [];

            var requestSlotActivation = function(slot, action) {

                return this.requestSlotActivation(slot, action);
            }.bind(this);

            this.callbacks = {
                requestSlotActivation:requestSlotActivation
            }

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
                this.slots.push(new ActionSlot(slots[i]['slot_id'], i, slots[i]['x'], slots[i]['y'], this.callbacks.requestSlotActivation))
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

        ActionSlots.prototype.notifyAvailableActionPointCount = function(count) {

            for (var i = 0; i < this.slots.length; i++) {
                this.slots[i].updateSlotActionPointAvailability(count);
            }
        };


        ActionSlots.prototype.addRequestActivationCallback = function(cb) {
            this.requestActivationCallbacks.push(cb);
        };

        ActionSlots.prototype.requestSlotActivation = function(slot, action) {
            GuiAPI.getGuiDebug().printDebugText("REQ SLOT ACTIVATE");
            MATH.callAll(this.requestActivationCallbacks, slot, action);
        };

        ActionSlots.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        ActionSlots.prototype.removeActionSlots = function() {

            while (this.slots.length) {
                this.slots.pop().removeActionSlot()
            }
        };

        return ActionSlots;


    });

