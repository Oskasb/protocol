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


        GameMain.prototype.registerGamePiece = function( gamePiece) {
            this.pieces.push(gamePiece);
        };


        GameMain.prototype.getPieceById = function(pieceId) {
            return MATH.getFromArrayByKeyValue(this.pieces, 'pieceId', pieceId);
        };


        GameMain.prototype.removeGamePiece = function(gamePiece) {
            MATH.quickSplice(this.pieces, gamePiece);
            gamePiece.disposeGamePiece();
        };


        GameMain.prototype.updateGameMain = function(tpf, time) {

            for (var i = 0; i < this.pieces.length; i++) {
                this.pieces[i].updateGamePiece(tpf, time);
            }

        };

        return GameMain;

    });

