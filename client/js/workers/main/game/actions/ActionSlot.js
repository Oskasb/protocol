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
            console.log("new ActionSlot", slotId, index);

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
            this.actionButton.updateSufficientActionPoints(this.getSlotCurrentAction(), count);
        };

        ActionSlot.prototype.activateCurrentSlottedAction = function() {

            this.currentAction.activateActionNow();
            this.actionButton.actionButtonTriggerUiUpdate();
            return this.currentAction;
        };

        ActionSlot.prototype.setSlotAction = function(action) {
            this.currentAction = action;

            action.addActionActivateCallback(this.callbacks.actionActivate);

            var _this = this;

            var buttonReady = function(actionButton) {
                actionButton.attachActionToButton(action);
                _this.actionButton = actionButton;
            };

            GuiAPI.buildGuiWidget('GuiActionButton', {configId:"widget_action_button", offset_x:this.x, offset_y:this.y}, buttonReady);

            console.log("Set Slot Action", action);
        };

        ActionSlot.prototype.removeActionSlot = function() {
            this.actionButton.removeGuiWidget();
            this.getSlotCurrentAction().removeActionActivateCallback(this.callbacks.actionActivate)
        };

        return ActionSlot;


    });

