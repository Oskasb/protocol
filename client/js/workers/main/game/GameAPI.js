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
        var testWeapon;

        var slots = ['GRIP_R', 'PROP_2', 'PROP_3'];
        var skinItems = ["SHIRT_CHAIN", "SHIRT_SCALE", "LEGS_CHAIN","LEGS_SCALE"];

        GameAPI.loadTestPiece = function() {
            testPiece = !testPiece;


            var hatReady = function(hatPiece) {
                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(hatPiece.getWorldEntity(), 'HEAD')
            };

            var beltReady = function(hatPiece) {
                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(hatPiece.getWorldEntity(), 'PELVIS')
            };

            var skinReady = function(skinPiece) {
                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(skinPiece.getWorldEntity(), 'SKIN')
                if (skinItems.length) {
                    pieceBuilder.buildGamePiece(skinItems.pop(), skinReady);
                }
            };

            var onReady = function(gamePiece) {

                testPieceId = gamePiece.pieceId;
                console.log("PieceReady ", gamePiece);

                gameMain.registerGamePiece(gamePiece);


                if (!testWeapon) {
                    pieceBuilder.buildGamePiece("NINJASWORD", testWeapRdy);
                    pieceBuilder.buildGamePiece("HELMET_VIKING", hatReady);
                    pieceBuilder.buildGamePiece("BELT_PLATE", beltReady);
                    pieceBuilder.buildGamePiece(skinItems.pop(), skinReady);

                }

            };

            var testWeapRdy = function(piece) {
                console.log("SwordReady ", piece);

                if (!testWeapon) {
                    GuiAPI.getGuiDebug().debugPieceAnimations(gameMain.getPieceById(testPieceId));
                    GuiAPI.getGuiDebug().debugPieceAttachmentPoints(gameMain.getPieceById(testPieceId), piece);
                }

                testWeapon = piece;

                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(testWeapon.getWorldEntity(), slots.pop())

                if (slots.length) {
                    pieceBuilder.buildGamePiece("NINJASWORD", testWeapRdy)
                }

            };

            GuiAPI.printDebugText("LOAD TEST PIECE "+testPiece);
            if (testPiece) {

                pieceBuilder.buildGamePiece("FIGHTER", onReady);

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

