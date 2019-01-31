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

        Character.prototype.setActorGui = function( actorGui) {
            this.actorGui = actorGui;
        };

        Character.prototype.getActorGui = function( ) {
            return this.actorGui
        };

        Character.prototype.setCharacterCombat = function(characterCombat ) {
            this.characterCombat = characterCombat;
        };

        Character.prototype.getCharacterCombat = function( ) {
            return this.characterCombat
        };

        Character.prototype.getSlotForAction = function(action) {
            return this.getCharacterCombat().getFreeSlotForAction(action);
        };

        Character.prototype.setActionInSlot = function(action, slot) {
            slot.setSlotAction(action);
            action.addActionStateChangeCallback(this.callbacks.actionStateUpdate)
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
        //    console.log("Equip Item to Character", item, slot);
        };

        Character.prototype.characterActionStateUpdate = function(action) {
            this.getGamePiece().actionStateUpdated(action);
        };


        Character.prototype.updateCharacter = function(tpf, time) {

            if (Math.random() < 0.7) {
                if (!this.getGamePiece().activeActions.length) {
                    this.getCharacterCombat().activateRandomAvailableAction();
                }
            }

        };


        Character.prototype.disposeCharacter = function(gameMain) {

            gameMain.removeGamePiece(this.getGamePiece());
            if (this.getActorGui().guiWidgetCount()) {
                GuiAPI.detachActorGui(this);
            }

        };

        return Character;

    });

