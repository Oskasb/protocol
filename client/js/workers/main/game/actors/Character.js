"use strict";

define([

    ],
    function(

    ) {

        var Character = function() {

        };

        Character.prototype.initCharacter = function( characterId, workerData, onReady) {
            this.characterId = characterId;
            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);


            var updateCharacter = function(tpf, time) {
                this.updateCharacter(tpf, time);
            }.bind(this);

            var actionStateUpdate = function(tpf, time) {
                this.characterActionStateUpdate(tpf, time);
            }.bind(this);

            this.callbacks = {
                updateCharacter:updateCharacter,
                actionStateUpdate:actionStateUpdate
            };

            workerData.fetchData(characterId, onDataReady);
        };

        Character.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        Character.prototype.setGamePiece = function( gamePiece) {
            this.gamePiece = gamePiece;
            gamePiece.addPieceUpdateCallback(this.callbacks.updateCharacter);
        };

        Character.prototype.getGamePiece = function( ) {
            return this.gamePiece;
        };

        Character.prototype.setActiontSlots = function( actionSlots) {
            this.actionSlots = actionSlots;
        };

        Character.prototype.getActiontSlots = function( ) {
            return this.actionSlots
        };

        Character.prototype.getSlotForAction = function(action) {

            return this.actionSlots.getAvailableActionSlot(action);
        };

        Character.prototype.setActionInSlot = function(action, slot) {

            slot.setSlotAction(action)
        };

        Character.prototype.setEquipmentSlots = function( equipmentSlots) {
            this.equipmentSlots = equipmentSlots;
        };

        Character.prototype.getEquipmentSlots = function( ) {
            return this.equipmentSlots
        };

        Character.prototype.getSlotForItem = function(item) {

            return this.equipmentSlots.getEquipmentSlotForItem(item);

        };

        Character.prototype.equipItemToSlot = function(item, slot) {

            slot.setEquippedSlotItem(item, this.getGamePiece());
            console.log("Equip Item to Character", item, slot);

        };

        Character.prototype.characterActionStateUpdate = function(action) {
            this.getGamePiece().actionStateUpdated(action);
        };

        Character.prototype.activateNextAvailableAction = function() {

            if (this.getGamePiece().activeActions.length) return;

            var slot = MATH.getRandomArrayEntry(this.actionSlots.slots);
                if (slot.isReadyForActivation()) {
                    var action = slot.activateCurrentSlottedAction();
                    action.addActionStateChangeCallback(this.callbacks.actionStateUpdate);
                }

        };

        Character.prototype.updateCharacter = function(tpf, time) {

            if (Math.random() < 0.1) {
                this.activateNextAvailableAction();
            }


        };


        return Character;


    });

