"use strict";

var GameAPI;

define([
        'game/GameMain',
        'game/GameAssets',
        'game/pieces/PieceBuilder'
    ],
    function(
        GameMain,
        GameAssets,
        PieceBuilder
    ) {

        var testPiece = false;
        var gameMain = new GameMain();
        var gameAssets = new GameAssets();

        var pieceBuilder = new PieceBuilder();

        GameAPI = function() {};

        GameAPI.initGameAPI = function() {

        };

        var testPieceId;

        GameAPI.loadTestPiece = function() {
            testPiece = !testPiece;

            var onReady = function(gamePiece) {
                testPieceId = gamePiece.pieceId;
                console.log("PieceReady ", gamePiece);
                GuiAPI.getGuiDebug().debugPieceAnimations(gamePiece);
                GuiAPI.getGuiDebug().debugPieceAttachmentPoints(gamePiece);
                gameMain.registerGamePiece(gamePiece);
            };

            GuiAPI.printDebugText("LOAD TEST PIECE "+testPiece);
            if (testPiece) {

                pieceBuilder.buildGamePiece("FIGHTER", onReady)

            } else {
                var piece = gameMain.getPieceById(testPieceId);
                gameMain.removeGamePiece(piece);
            }

        };


        GameAPI.testPieceLoaded = function() {
            return testPiece;
        };

        GameAPI.requestAssetWorldEntity = function(modelAssetId, cb) {
            gameAssets.requestGameAsset(modelAssetId, cb)
        };

        GameAPI.getGameAssets = function() {
            return gameAssets;
        };

        GameAPI.updateGame = function(tpf, time) {
            gameMain.updateGameMain(tpf, time);
        };

        return GameAPI;
    });

