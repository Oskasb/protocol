"use strict";

define([
        'workers/WorkerData',
        'game/pieces/PieceAnimator',
        'game/pieces/PieceAttacher',
        'game/GamePiece'
    ],
    function(
        WorkerData,
        PieceAnimator,
        PieceAttacher,
        GamePiece
    ) {

        var count = 0;

        var PieceBuilder = function() {

        };


        var loadPiece = function(dataId, onReady) {

            var pieceId = 'piece_'+count+'_'+dataId;

            var piece = new GamePiece(dataId);

            piece.initGamePiece(pieceId, new WorkerData("GAME", "PIECES"));


            var setupGamePiece = function(piece, onReady) {

                GuiAPI.printDebugText("SETUP GAME PIECE "+piece.readConfigData("model_asset"));

                var modelAssetId = piece.readConfigData('model_asset');

                var worldEntityReady = function(worldEntity) {
                    console.log("ENT RDY", worldEntity)
                    piece.setWorldEntity(worldEntity);
                    configureEntityPiece(piece, onReady)
                };

                GameAPI.requestAssetWorldEntity(modelAssetId, worldEntityReady)

            };

            var configureEntityPiece = function(piece, onReady) {

                var pieceAttacher = new PieceAttacher();

                pieceAttacher.initPieceAttacher(piece);

                var pieceAnimator = new PieceAnimator();

                var animatorReady = function(pa) {
                    GuiAPI.printDebugText("ANIMATOR RDY "+pa.gamePiece.dataId);
                    onReady(pa.gamePiece);
                };

                pieceAnimator.initPieceAnimator(piece, animatorReady);

            };

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    setupGamePiece(piece, onReady);
                }
            };

            piece.workerData.fetchData(piece.dataId, onDataReady);
        };


        PieceBuilder.prototype.buildGamePiece = function( dataId, onReady) {

            count++;
            new loadPiece(dataId, onReady);
        };



        return PieceBuilder;

    });

