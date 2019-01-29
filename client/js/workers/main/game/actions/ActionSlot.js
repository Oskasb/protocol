"use strict";

define([

    ],
    function(

    ) {

        var ActionSlot = function(slotId, index, x, y) {
            this.slotId = slotId;
            this.x = x;
            this.y = y;
            this.index = index;
            this.currentAction = null;
            console.log("new ActionSlot", slotId, index);
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

        ActionSlot.prototype.activateCurrentSlottedAction = function() {

            this.currentAction.activateActionNow();
            this.actionButton.actionButtonTriggerUiUpdate();
            return this.currentAction;
        };

        ActionSlot.prototype.setSlotAction = function(action) {
            this.currentAction = action;

            var _this = this;

            var buttonReady = function(actionButton) {
                actionButton.attachActionToButton(action);
                _this.actionButton = actionButton;
            };

            GuiAPI.buildGuiWidget('GuiActionButton', {configId:"widget_action_button", offset_x:this.x, offset_y:this.y}, buttonReady);

            console.log("Set Slot Action", action);
        };


        return ActionSlot;


    });

