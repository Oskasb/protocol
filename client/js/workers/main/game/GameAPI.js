"use strict";

var GameAPI;

define([
        'game/GameMain',
        'game/GameAssets'
    ],
    function(
        GameMain,
        GameAssets
    ) {

        var testPiece = false;
        var gameMain = new GameMain();
        var gameAssets = new GameAssets();

        GameAPI = function() {};

        GameAPI.initGameAPI = function() {

        };


        GameAPI.loadTestPiece = function() {
            testPiece = !testPiece;

            var onReady = function(gamePiece) {
                console.log("PieceReady ", gamePiece);
            };

            GuiAPI.printDebugText("LOAD TEST PIECE "+testPiece);
            if (testPiece) {
                gameMain.requestNewGamePiece("test_piece", "BARBARIAN", onReady);
            } else {
                var piece = gameMain.getPieceById("test_piece");
                gameMain.removeGamePiece(piece);
            }

        };


        GameAPI.testPieceLoaded = function() {
            return testPiece;
        };

        GameAPI.requestModelAsset = function(modelAssetId, cb) {
            gameAssets.requestGameAsset(modelAssetId, cb)
        };

        GameAPI.getGameAssets = function() {
            return gameAssets;
        };

        GameAPI.updateGame = function(tpf, time) {

        };

        return GameAPI;
    });

