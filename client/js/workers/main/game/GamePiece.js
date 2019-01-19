"use strict";



define([
        'workers/WorkerData'
    ],
    function(
        WorkerData
    ) {


        var GamePiece = function() {
            this.pieceId = null;
            this.workerData = new WorkerData("GAME", "PIECES")
        };

        GamePiece.prototype.initGamePiece = function(pieceId, dataId, onReady) {

            this.pieceId = pieceId;

            var onDataReady = function() {
                this.setupGamePiece(onReady);
            }.bind(this);

            this.workerData.fetchData(dataId, onDataReady);

        };


        GamePiece.prototype.setupGamePiece = function(onReady) {

            GuiAPI.printDebugText("SETUP GAME PIECE "+this.workerData.readDataKey("model_asset"));

            var modelAssetId = this.workerData.readDataKey('model_asset');

            var worldEntityReady = function(worldEntity) {
                this.worldEntity = worldEntity;
                onReady(this);

            }.bind(this);

            GameAPI.requestAssetWorldEntity(modelAssetId, worldEntityReady)

        };


        GamePiece.prototype.dispatchGamePiece = function() {

            GuiAPI.printDebugText("DISPATCH GAME PIECE "+this.pieceId);

        };




        return GamePiece;
    });

