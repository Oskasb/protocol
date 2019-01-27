"use strict";

define([

    ],
    function(

    ) {

        var Item = function() {

        };

        Item.prototype.initItem = function( itemId, workerData, onReady) {
            this.itemId = itemId;
            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);

            workerData.fetchData(itemId, onDataReady);
        };

        Item.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        Item.prototype.setGamePiece = function( gamePiece) {
            this.gamePiece = gamePiece;
        };

        Item.prototype.getGamePiece = function( ) {
            return this.gamePiece;
        };


        return Item;


    });

