"use strict";

define([
        'workers/WorkerData',
        'game/pieces/PieceAnimator',
        'game/GamePiece'
    ],
    function(
        WorkerData,
        PieceAnimator,
        GamePiece
    ) {

        var count = 0;

        var PieceBuilder = function() {

        };

        PieceBuilder.prototype.buildGamePiece = function( dataId, onReady) {

            var pieceId = 'piece_'+count+'_'+dataId;

            var piece = new GamePiece();
            piece.initGamePiece(pieceId, new WorkerData("GAME", "PIECES"));

            count++;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    this.setupGamePiece(piece, onReady);
                }
            }.bind(this);

            piece.workerData.fetchData(dataId, onDataReady);

        };


        PieceBuilder.prototype.setupGamePiece = function(piece, onReady) {

            GuiAPI.printDebugText("SETUP GAME PIECE "+piece.readConfigData("model_asset"));

            var modelAssetId = piece.readConfigData('model_asset');

            var worldEntityReady = function(worldEntity) {
                piece.setWorldEntity(worldEntity);
                this.configureEntityPiece(piece, onReady)
            }.bind(this);

            GameAPI.requestAssetWorldEntity(modelAssetId, worldEntityReady)

        };

        PieceBuilder.prototype.configureEntityPiece = function(piece, onReady) {

            var pieceAnimator = new PieceAnimator();

            var animatorReady = function(pa) {
                onReady(pa.gamePiece);
            };

            pieceAnimator.initPieceAnimator(piece, animatorReady);

        };

        return PieceBuilder;

    });

