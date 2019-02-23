"use strict";

define([

    ],
    function(

    ) {

        var Item = function() {
            this.itemType;
        };

        Item.prototype.initItem = function( itemId, workerData, onReady) {
            this.itemId = itemId;
            this.workerData = workerData;

            var pieceReady = function(gamePiece) {
                this.setGamePiece(gamePiece);
                onReady(this);
            }.bind(this);

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    this.itemType = this.readConfigData('item_type');
                    GameAPI.createGamePiece(this.readConfigData('game_piece'), pieceReady);
                }
            }.bind(this);

            workerData.fetchData(itemId, onDataReady);
        };

        Item.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        Item.prototype.setItemPosition = function( posVec) {
            this.gamePiece.getWorldEntity().setWorldEntityPosition(posVec);
        };


        Item.prototype.enableItemPhysics = function( ) {
            PhysicsWorldAPI.addPhysicsToWorldEntity(this.gamePiece.getWorldEntity())

        };

        Item.prototype.setGamePiece = function( gamePiece) {
            this.gamePiece = gamePiece;
        };

        Item.prototype.getGamePiece = function( ) {
            return this.gamePiece;
        };


        return Item;


    });

