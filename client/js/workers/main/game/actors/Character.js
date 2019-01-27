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

            workerData.fetchData(characterId, onDataReady);
        };

        Character.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        Character.prototype.setGamePiece = function( gamePiece) {
            this.gamePiece = gamePiece;
        };

        Character.prototype.getGamePiece = function( ) {
            return this.gamePiece;
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

            this.getGamePiece().attachWorldEntityToJoint(item.getGamePiece().getWorldEntity(), slot.joint);

            console.log("Equip Item to Character", item, slot);

        };


        return Character;


    });

