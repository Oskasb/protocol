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

        var slots = ['GRIP_R'];
        var skinItems = ["SHIRT_CHAIN", "SHIRT_SCALE", "LEGS_CHAIN","LEGS_SCALE", 'BOOTS_SCALE', 'GLOVES_SCALE'];

        var equipItems = ["ITEM_KATANA"];

        var character;

        GameAPI.loadTestPiece = function() {
            testPiece = !testPiece;

            var itemReady = function(item) {
                var slot = character.getSlotForItem(item);
                character.equipItemToSlot(item, slot);
            };

            var charReady = function(char) {
                character = char;
                console.log("Char Ready")
                gameMain.registerGamePiece(char.getGamePiece());
                GuiAPI.getGuiDebug().debugPieceAnimations(char.getGamePiece());

                while (equipItems.length) {
                    GameAPI.createGameItem(equipItems.pop(), itemReady);
                }
            };

            GameAPI.createGameCharacter('CHARACTER_FIGHTER', charReady);
            return;

            var hatReady = function(hatPiece) {
                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(hatPiece.getWorldEntity(), 'HEAD')
            };

            var beltReady = function(hatPiece) {
                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(hatPiece.getWorldEntity(), 'PELVIS')
            };

            var skinReady = function(skinPiece) {
                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(skinPiece.getWorldEntity(), 'SKIN')
            //    if (skinItems.length) {
            //        pieceBuilder.buildGamePiece(skinItems.pop(), skinReady);
            //    }
            };

            var onReady = function(gamePiece) {

                testPieceId = gamePiece.pieceId;
                console.log("PieceReady ", gamePiece);

                gameMain.registerGamePiece(gamePiece);


                if (!testWeapon) {
                    pieceBuilder.buildGamePiece("NINJASWORD", testWeapRdy);
                    pieceBuilder.buildGamePiece("HELMET_VIKING", hatReady);
                    pieceBuilder.buildGamePiece("BELT_PLATE", beltReady);
                    // pieceBuilder.buildGamePiece(skinItems.pop(), skinReady);

                        while (skinItems.length) {
                            pieceBuilder.buildGamePiece(skinItems.pop(), skinReady);
                        }

                }

            };

            var testWeapRdy = function(piece) {
                console.log("SwordReady ", piece);

                if (!testWeapon) {
                    GuiAPI.getGuiDebug().debugPieceAnimations(gameMain.getPieceById(testPieceId));
                    GuiAPI.getGuiDebug().debugPieceAttachmentPoints(gameMain.getPieceById(testPieceId), piece);
                }

                testWeapon = piece;

                gameMain.getPieceById(testPieceId).attachWorldEntityToJoint(testWeapon.getWorldEntity(), slots.pop());

                if (slots.length) {
                    pieceBuilder.buildGamePiece("NINJASWORD", testWeapRdy)
                }

            };

            GuiAPI.printDebugText("LOAD TEST PIECE "+testPiece);
            if (testPiece) {

                pieceBuilder.buildGamePiece("PIECE_FIGHTER", onReady);

            } else {
                var piece = gameMain.getPieceById(testPieceId);
                gameMain.removeGamePiece(piece);
            }

        };

        GameAPI.createGamePiece = function(dataId, onReady) {
            pieceBuilder.buildGamePiece(dataId, onReady);
        };

        GameAPI.createGameCharacter = function(dataId, onReady) {
            pieceBuilder.buildCharacter(dataId, onReady);
        };

        GameAPI.createGameItem = function(dataId, onReady) {
            pieceBuilder.buildItem(dataId, onReady);
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

