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

        var equipItems = [
            "ITEM_KATANA",
            "ITEM_VIKINGHELMET",
            "ITEM_PLATEBELT",
            "ITEM_CHAINSHIRT",
        //    "ITEM_SCALEMAIL",
            "ITEM_CHAINLEGGINGS",
        //    "ITEM_SCALESKIRT",
            "ITEM_SCALEBOOTS",
            "ITEM_SCALEGLOVES"
        ];

        var defaultActions = [
            "CHOP",

            "SLASH",

            "SWIPE",
            "SWING",
            "CUT"
            /*
           */
        ];


        var character;

        GameAPI.loadTestPiece = function() {
            testPiece = !testPiece;

            var actionReady = function(action) {
                var slot = character.getSlotForAction(action);
                character.setActionInSlot(action, slot);
            };

            var itemReady = function(item) {
                var slot = character.getSlotForItem(item);
                character.equipItemToSlot(item, slot);
            };



            var charReady = function(char) {
                character = char;
                console.log("Char Ready")
                gameMain.registerGamePiece(char.getGamePiece());
                GuiAPI.getGuiDebug().debugPieceAnimations(char.getGamePiece());

                for (var i = 0; i < equipItems.length; i++) {
                    GameAPI.createGameItem(equipItems[i], itemReady);
                }

                for (var i = 0; i < defaultActions.length; i++) {
                    GameAPI.createGameAction(defaultActions[i], actionReady);
                }
            };

            if (testPiece) {
                console.log("ADD CHAR")
                GameAPI.createGameCharacter('CHARACTER_FIGHTER', charReady);

            } else {
                console.log("REMOVE CHAR")
                character.disposeCharacter(gameMain)

                GuiAPI.getGuiDebug().removeDebugAnimations();
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

        GameAPI.createGameAction = function(dataId, onReady) {
            pieceBuilder.buildCombatAction(dataId, onReady);
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

