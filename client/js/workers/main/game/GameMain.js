"use strict";



define([
        'game/GamePiece'
    ],
    function(
        GamePiece
    ) {


        var GameMain = function() {
            this.pieces = [];

        };


        GameMain.prototype.requestNewGamePiece = function(pieceId, dataId, onReady) {
            var gamePiece = new GamePiece();
            this.pieces.push(gamePiece);
            gamePiece.initGamePiece(pieceId, dataId, onReady)
        };

        GameMain.prototype.getPieceById = function(pieceId) {
            return MATH.getFromArrayByKeyValue(this.pieces, 'id', pieceId);
        };

        GameMain.prototype.removeGamePiece = function(gamePiece) {
            MATH.quickSplice(this.pieces, gamePiece);
            gamePiece.dispatchGamePiece();
        };


        GameMain.prototype.updateGameMain = function(tpf, time) {

        };


        return GameMain;
    });

