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

    var tempObj3d = new THREE.Object3D();
        var testPiece = false;
        var gameMain = new GameMain();
        var gameAssets = new GameAssets();

        var pieceBuilder = new PieceBuilder();

        var playerCharacter;

        GameAPI = function() {};

        GameAPI.initGameAPI = function() {

        };


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
        var character2;

        var spawn = ['CHARACTER_FIGHTER', 'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER',
            'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER', 'CHARACTER_FIGHTER']

        GameAPI.loadTestPiece = function() {
            testPiece = !testPiece;



            var charReady = function(char) {
                character = char;
                console.log("Char Ready")
                gameMain.registerGamePiece(char.getGamePiece());
                GuiAPI.getGuiDebug().debugPieceAnimations(char.getGamePiece());

                GameAPI.setPlayerCharacter(character)


                var actionReady = function(action) {
                    var slot = character.getSlotForAction(action);
                    character.setActionInSlot(action, slot);
                };

                var itemReady = function(item) {
                    var slot = character.getSlotForItem(item);
                    character.equipItemToSlot(item, slot);
                };

                for (var i = 0; i < equipItems.length; i++) {
                    GameAPI.createGameItem(equipItems[i], itemReady);
                }

                for (var i = 0; i < defaultActions.length; i++) {
                    GameAPI.createGameAction(defaultActions[i], actionReady);
                }
                setTimeout(function() {
                    GameAPI.createGameCharacter('CHARACTER_FIGHTER', char2Ready);
                }, 2000)

            };

            var px = 0;

            var char2Ready = function(char) {
                character2 = char;
                console.log("Char2 Ready")
                gameMain.registerGamePiece(char.getGamePiece());
            //    GuiAPI.getGuiDebug().debugPieceAnimations(char.getGamePiece());

//                GameAPI.enableCharacterControlGui(character2);

                var scale = Math.random()*0.9+0.4;
                GameAPI.transformGamePiece(char.getGamePiece(), px++, 0, 2 + px%6, 0, 3.14, 0, scale, scale, scale);

                var action2Ready = function(action) {
                    var slot = character2.getSlotForAction(action);
                    character2.setActionInSlot(action, slot);
                };

                var item2Ready = function(item) {
                    var slot = character2.getSlotForItem(item);
                    character2.equipItemToSlot(item, slot);
                };

            //    for (var i = 0; i < equipItems.length; i++) {
                    GameAPI.createGameItem("ITEM_KATANA", item2Ready);
                GameAPI.createGameItem("ITEM_VIKINGHELMET", item2Ready);
                GameAPI.createGameItem("ITEM_PLATEBELT", item2Ready);
            //    }

                for (var i = 0; i < defaultActions.length; i++) {
                    GameAPI.createGameAction(defaultActions[i], action2Ready);
                }

                setTimeout(function() {
                    if (spawn.length) {
                        GameAPI.createGameCharacter(spawn.pop(), char2Ready);
                    }

                }, 20)

            };

            if (testPiece) {
                console.log("ADD CHAR");
                GameAPI.createGameCharacter('CHARACTER_FIGHTER', charReady);

            } else {
                console.log("REMOVE CHAR");
                character.disposeCharacter(gameMain);

                GuiAPI.getGuiDebug().removeDebugAnimations();
            }

        };

        GameAPI.transformGamePiece = function(gamePiece, px, py, pz, rx, ry, rz, sx, sy, sz) {
            tempObj3d.quaternion.set(0, 0, 0, 1);
            tempObj3d.position.set(px, py, pz);
            tempObj3d.rotateX(rx);
            tempObj3d.rotateY(ry);
            tempObj3d.rotateZ(rz);
            tempObj3d.scale.set(sx, sy, sz);
            gamePiece.getWorldEntity().setWorldEntityPosition(tempObj3d.position);
            gamePiece.getWorldEntity().setWorldEntityQuaternion(tempObj3d.quaternion);
            gamePiece.getWorldEntity().setWorldEntityScale(tempObj3d.scale);
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

        GameAPI.enableCharacterControlGui = function( character ) {
            pieceBuilder.attachCharacterGui( character );
        };

        GameAPI.testPieceLoaded = function() {
            return testPiece;
        };


        GameAPI.setPlayerCharacter = function(char) {
            GameAPI.enableCharacterControlGui(char);
            playerCharacter = char;
        };

        GameAPI.getPlayerCharacter = function() {
            return playerCharacter;
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

