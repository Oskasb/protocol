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

            onReady(this);
        };


        GamePiece.prototype.dispatchGamePiece = function() {

            GuiAPI.printDebugText("DISPATCH GAME PIECE "+this.pieceId);

        };




        return GamePiece;
    });

