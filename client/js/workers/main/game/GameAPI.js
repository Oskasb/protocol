"use strict";

var GameAPI;

define([
        'game/GameMain',
        'game/GameAssets',
        'game/pieces/PieceBuilder',
    'evt'
    ],
    function(
        GameMain,
        GameAssets,
        PieceBuilder,
        evt
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
            "ITEM_KATANA"         ,
            "ITEM_HELMET_BRONZE"  ,
            "ITEM_BELT_BRONZE"         ,
            "ITEM_BREASTPLATE_BRONZE"     ,
        //    "ITEM_SCALEMAIL"    ,
            "ITEM_LEGS_BRONZE"    ,
        //    "ITEM_SCALESKIRT"   ,
            "ITEM_SCALEBOOTS"     ,
            "ITEM_SCALEGLOVES"
        ];

        var equipItems2 = [
            "ITEM_KATANA"        ,
            "ITEM_VIKINGHELMET"  ,
            "ITEM_PLATEBELT"     ,
            "ITEM_CHAINSHIRT"    ,
            //    "ITEM_SCALEMAIL",
            "ITEM_CHAINLEGGINGS" ,
            //    "ITEM_SCALESKIRT",
            "ITEM_SCALEBOOTS"    ,
            "ITEM_SCALEGLOVES"
        ];

        var staticItems = [
            "ITEM_KATANA"        ,
            "ITEM_VIKINGHELMET"  ,
            "ITEM_PLATEBELT"     ,
            "ITEM_HELMET_BRONZE"  ,
            "ITEM_BELT_BRONZE"         ,
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

            var px = 0;
            var point;
            var charReady = function(char) {
                character = char;
                console.log("Char Ready")
                gameMain.registerGameCharacter(char);

                GameAPI.setPlayerCharacter(character);



                point = MainWorldAPI.getSuitableSpawnPoint(tempObj3d.position);
                px = point.x;
                char.getGamePiece().getWorldEntity().setWorldEntityPosition(point);

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
                }, 500)

            };


            var char2Ready = function(char) {
                character2 = char;
                console.log("Char2 Ready")
                gameMain.registerGameCharacter(char);

                var scale = Math.random()*0.9+0.4;
                point.x++;
                point.z++;

                GameAPI.getPlayerCharacter().getGamePiece().getWorldEntity().getWorldEntityPosition(tempObj3d.position);

                tempObj3d.position.x += (Math.random()-0.5)*5;
                tempObj3d.position.z += (Math.random()-0.5)*5;

                GameAPI.transformGamePiece(char.getGamePiece(), tempObj3d.position.x, tempObj3d.position.y, tempObj3d.position.z, 0, 3.14, 0, scale, scale, scale);

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


        GameAPI.dropCharacterItem = function(character) {



            var dropItemReady = function(item) {

                character.getCharacterPosition(tempObj3d.position);
                tempObj3d.position.y+=1.5;
                item.setItemPosition(tempObj3d.position);
                item.enableItemPhysics();

                tempObj3d.position.set(Math.random()-0.5,0, Math.random()-0.5);
                tempObj3d.position.normalize();
                tempObj3d.position.y += Math.random()+0.25;

                PhysicsWorldAPI.applyForceToWorldEntity(item.gamePiece.getWorldEntity(), tempObj3d.position)
        //        console.log("Character Drop Item",item, character);

            };

            //    for (var i = 0; i < equipItems.length; i++) {
            GameAPI.createGameItem(MATH.getRandomArrayEntry(staticItems), dropItemReady);

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

        GameAPI.getGameMain = function() {
            return gameMain;
        };

        GameAPI.updateGame = function(tpf, time) {
            gameMain.updateGameMain(tpf, time);
        };



        return GameAPI;
    });

