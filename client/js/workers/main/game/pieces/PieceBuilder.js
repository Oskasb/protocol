"use strict";

define([
        'workers/WorkerData',
        'game/pieces/PieceAnimator',
        'game/pieces/PieceAttacher',
        'game/actors/Character',
        'game/actors/Item',
        'game/equipment/EquipmentSlots',
        'game/GamePiece'
    ],
    function(
        WorkerData,
        PieceAnimator,
        PieceAttacher,
        Character,
        Item,
        EquipmentSlots,
        GamePiece
    ) {

        var count = 0;

        var PieceBuilder = function() {

        };

        var loadPiece = function(dataId, onReady) {

            var pieceId = 'piece_'+count+'_'+dataId;

            var piece = new GamePiece(dataId);

            piece.initGamePiece(pieceId, new WorkerData("GAME", "PIECES"), new WorkerData("GAME", "SKELETON_RIGS"));

            var setupGamePiece = function(piece, onReady) {

                GuiAPI.printDebugText("SETUP GAME PIECE "+piece.readConfigData("model_asset"));

                var modelAssetId = piece.readConfigData('model_asset');

                var worldEntityReady = function(worldEntity) {
            //        console.log("ENT RDY", worldEntity)
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
            loadPiece(dataId, onReady);
        };





        PieceBuilder.prototype.buildCharacter = function( dataId, onReady) {

            var onDataReady = function(char) {

                var pieceReady = function(gamePiece) {

                    char.setGamePiece(gamePiece);
                    onReady(char);
                };


                var eqSlotsReady = function(eqSlots) {
                    char.setEquipmentSlots(eqSlots);
                    GameAPI.createGamePiece(char.readConfigData('game_piece'), pieceReady);
                };


                var eqSlots = new EquipmentSlots();
                var eqDataId = char.readConfigData('equip_slots');

                eqSlots.initEquipmentSlots(eqDataId, new WorkerData("GAME", "EQUIP_SLOTS"), eqSlotsReady)

            };

            var char = new Character();
            char.initCharacter(dataId, new WorkerData("GAME", "CHARACTERS"), onDataReady)

        };


        PieceBuilder.prototype.buildItem = function( dataId, onReady) {

            var onDataReady = function(item) {

                var pieceReady = function(gamePiece) {

                    item.setGamePiece(gamePiece);
                    onReady(item);
                };

                GameAPI.createGamePiece(item.readConfigData('game_piece'), pieceReady);

            };

            var item = new Item();
            item.initItem(dataId, new WorkerData("GAME", "GAME_ITEMS"), onDataReady)

        };

        return PieceBuilder;

    });

