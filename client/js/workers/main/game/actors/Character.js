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

            this.characterState = ENUMS.CharacterState.IDLE;

            this.characterUpdateCallbacks = [];

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

            var equipItem = function(item) {
                let slot = this.getSlotForItem(item);
                this.equipItemToSlot(item, slot);
            }.bind(this);

            this.callbacks = {
                updateCharacter:updateCharacter,
                actionStateUpdate:actionStateUpdate,
                equipItem:equipItem
            };

            workerData.fetchData(characterId, onDataReady);

        };

        Character.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        Character.prototype.setCharacterState = function(state) {
            this.characterState = state
        };

        Character.prototype.getCharacterState = function() {
            return this.characterState
        };

        Character.prototype.setGamePiece = function( gamePiece) {
            this.gamePiece = gamePiece;
            this.getCharacterCombat().setWorldEntity(gamePiece.getWorldEntity());
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

        Character.prototype.setCharacterMovement = function( characterMovement) {
            this.characterMovement = characterMovement;
        };

        Character.prototype.getCharacterMovement = function( ) {
            return this.characterMovement
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
            this.equipmentSlots = equipmentSlots
        };

        Character.prototype.getEquipmentSlots = function( ) {
            return this.equipmentSlots
        };

        Character.prototype.getSlotForItem = function(item) {
            return this.equipmentSlots.getEquipmentSlotForItem(item)
        };

        Character.prototype.equipItemToSlot = function(item, slot) {
            slot.setEquippedSlotItem(item, this.getGamePiece())
        //    console.log("Equip Item to Character", item, slot);
        };

        Character.prototype.equipItemOfDataId = function(dataId) {
            GameAPI.createGameItem(dataId, this.callbacks.equipItem);
        };

        Character.prototype.characterActionStateUpdate = function(action) {
            this.getGamePiece().actionStateUpdated(action)
        };


        Character.prototype.getCharacterQuaternion = function(storeQuat) {
            this.getGamePiece().getWorldEntity().getWorldEntityQuat(storeQuat)
        };

        Character.prototype.getCharacterPosition = function(storeVec) {
            this.getGamePiece().getWorldEntity().getWorldEntityPosition(storeVec)
        };

        Character.prototype.addUpdateCallback = function(cb) {
            this.characterUpdateCallbacks.push(cb)
        };

        Character.prototype.removeUpdateCallback = function(cb) {
            MATH.quickSplice(this.characterUpdateCallbacks, cb)
        };

        Character.prototype.updateCharacter = function(tpf, time) {

            this.t = this.t || 0;
            this.t += tpf;


            MATH.callAll(this.characterUpdateCallbacks, tpf, time, this);

            this.characterMovement.applyMovementToWorldEntity(this.getGamePiece().getWorldEntity(), tpf);

            if (this.t > 15.0 + Math.random()*5) {
                this.t = 0;
                if (this.getCharacterState() === ENUMS.CharacterState.COMBAT) {
                    this.setCharacterState(ENUMS.CharacterState.IDLE)
                } else {
                    this.setCharacterState(ENUMS.CharacterState.COMBAT)
                    this.t += 10;
                }

            } else if (this.getCharacterState() === ENUMS.CharacterState.COMBAT) {
                if (Math.random() < 0.1) {
                    if (!this.getGamePiece().activeActions.length) {
                        this.getCharacterCombat().activateRandomAvailableAction(this.getGamePiece().getWorldEntity());
                    }
                }
            }


            this.getGamePiece().animateMovementState(this.getCharacterState(), this.getCharacterMovement())

        };


        Character.prototype.disposeCharacter = function(gameMain) {

            MATH.emptyArray(this.characterUpdateCallbacks);

            gameMain.removeGamePiece(this.getGamePiece());

            if (this.getActorGui().guiWidgetCount()) {
                GuiAPI.detachActorGui(this);
            }

        };

        return Character;

    });

