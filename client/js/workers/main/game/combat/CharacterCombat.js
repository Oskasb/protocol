"use strict";

define([

    ],
    function(

    ) {

        var CharacterCombat = function() {

            var requestActionSlotActivation = function(slot, action) {
                this.requestActionSlotActivation(slot, action);
            }.bind(this);

            var notifyAvailableActionPoints = function(count) {
                this.notifyAvailableActionPoints(count);
            }.bind(this);


            this.callbacks = {
                requestActionSlotActivation:requestActionSlotActivation,
                notifyAvailableActionPoints:notifyAvailableActionPoints
            }

        };

        CharacterCombat.prototype.setWorldEntity = function(worldEntity) {
            this.worldEntity = worldEntity
        };

        CharacterCombat.prototype.getFreeSlotForAction = function( action ) {
            return this.getActiontSlots().getAvailableActionSlot(action);
        };


        CharacterCombat.prototype.setActiontSlots = function( actionSlots ) {
            actionSlots.addRequestActivationCallback(this.callbacks.requestActionSlotActivation);
            this.actionSlots = actionSlots;
        };

        CharacterCombat.prototype.getActiontSlots = function( ) {
            return this.actionSlots
        };

        CharacterCombat.prototype.setActiontPoints = function( actionPoints ) {
            actionPoints.addActionPointsUpdatedCallback(this.callbacks.notifyAvailableActionPoints);
            this.actionPoints = actionPoints;
        };

        CharacterCombat.prototype.getActionPoints = function( ) {
            return this.actionPoints
        };

        CharacterCombat.prototype.notifyAvailableActionPoints = function(points) {
           this.getActiontSlots().notifyAvailableActionPointCount(points)
        };

        CharacterCombat.prototype.checkSufficientActionPoints = function(action) {
            return (this.getActionPoints().countReadyActionPoints() >= action.getActionPointCost())
        };


        CharacterCombat.prototype.requestActionSlotActivation = function(slot, action) {

            if (slot.isReadyForActivation()) {
                if (this.checkSufficientActionPoints(action)) {
                    slot.activateCurrentSlottedAction();
                    let cost = action.getActionPointCost()
                    this.getActionPoints().consumeActionPoints(cost)

                    for (var i = 0; i < cost; i++) {

                        let joint = MATH.getRandomArrayEntry(this.worldEntity.attachmentJoints);

                        if (joint) {

                            EffectAPI.setupJointEffect(joint, 'effect_action_point_wisp')

                        }
                    }

                }
            }
        };

        CharacterCombat.prototype.activateRandomAvailableAction = function() {
            var slot = MATH.getRandomArrayEntry(this.getActiontSlots().slots);
            this.requestActionSlotActivation(slot, slot.getSlotCurrentAction());
        };


        return CharacterCombat;


    });

