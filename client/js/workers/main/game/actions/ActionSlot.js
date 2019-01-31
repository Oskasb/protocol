"use strict";

define([

    ],
    function(

    ) {

        var ActionSlot = function(slotId, index, x, y, requestSlotActivation) {
            this.slotId = slotId;
            this.x = x;
            this.y = y;
            this.index = index;
            this.currentAction = null;
        //    console.log("new ActionSlot", slotId, index);

            this.actionTriggeredCallbacks = [];
            this.actionPointUpdateCallbacks = [];
            this.actionSlotRemovedCallbacks = [];
            this.setSlotActionCallbacks = [];

            var actionActivate = function(action) {
                requestSlotActivation(this, action);
            }.bind(this);

            this.callbacks = {
                actionActivate:actionActivate
            }

        };

        ActionSlot.prototype.initActionSlot = function( actionId) {

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);

            this.workerData.fetchData(actionId, onDataReady);
        };

        ActionSlot.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        ActionSlot.prototype.isReadyForActivation = function() {
            if (this.currentAction) {
                return this.currentAction.testAvailable();
            }
        };

        ActionSlot.prototype.isSuitableForAction = function(action) {
            if (!this.currentAction) {
                return true
            }
        };

        ActionSlot.prototype.getSlotCurrentAction = function() {
            return this.currentAction;
        };

        ActionSlot.prototype.updateSlotActionPointAvailability = function(count) {

            this.getSlotCurrentAction().updateAvailableAcionPointCount(count);
            this.notifyActionPointUpdate(this.getSlotCurrentAction(), count);
            //this.actionButton.updateSufficientActionPoints(this.getSlotCurrentAction(), count);
        };

        ActionSlot.prototype.activateCurrentSlottedAction = function() {

            this.currentAction.activateActionNow();
            this.notifyActionTriggered();
            return this.currentAction;
        };

        ActionSlot.prototype.setSlotAction = function(action) {

            this.currentAction = action;
            action.addActionActivateCallback(this.callbacks.actionActivate);
            this.notifySetSlotAction(action);

        };


        ActionSlot.prototype.addActionTriggeredCallback = function(cb) {
            this.actionTriggeredCallbacks.push(cb)
        };

        ActionSlot.prototype.removeActionTriggeredCallback = function(cb) {
            MATH.quickSplice(this.actionTriggeredCallbacks, cb)
        };

        ActionSlot.prototype.notifyActionTriggered = function() {
            MATH.callAll(this.actionTriggeredCallbacks)
        };

        ActionSlot.prototype.addActionPointUpdateCallback = function(cb) {
            this.actionPointUpdateCallbacks.push(cb)
        };

        ActionSlot.prototype.removeActionPointUpdateCallback = function(cb) {
            MATH.quickSplice(this.actionPointUpdateCallbacks, cb)
        };

        ActionSlot.prototype.notifyActionPointUpdate = function(action, count) {
            MATH.callAll(this.actionPointUpdateCallbacks, action, count)
        };

        ActionSlot.prototype.addSetSlotActionCallback = function(cb) {
            this.setSlotActionCallbacks.push(cb)
        };

        ActionSlot.prototype.removeSetSlotActionCallback = function(cb) {
            MATH.quickSplice(this.setSlotActionCallbacks, cb)
        };

        ActionSlot.prototype.notifySetSlotAction = function(action) {
            MATH.callAll(this.setSlotActionCallbacks, action)
        };

        ActionSlot.prototype.addActionSlotRemovedCallback = function(cb) {
            this.actionSlotRemovedCallbacks.push(cb)
        };

        ActionSlot.prototype.removeActionSlotRemovedCallback = function(cb) {
            MATH.quickSplice(this.actionSlotRemovedCallbacks, cb)
        };

        ActionSlot.prototype.notifyActionSlotRemoved = function() {
            MATH.callAll(this.actionSlotRemovedCallbacks)
        };

        ActionSlot.prototype.removeActionSlot = function() {

            this.notifyActionSlotRemoved();

            MATH.emptyArray(this.actionSlotRemovedCallbacks);
            MATH.emptyArray(this.setSlotActionCallbacks);
            MATH.emptyArray(this.actionPointUpdateCallbacks);
            MATH.emptyArray(this.actionTriggeredCallbacks);

            this.getSlotCurrentAction().removeActionActivateCallback(this.callbacks.actionActivate)

        };

        return ActionSlot;


    });

