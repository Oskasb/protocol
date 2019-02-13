"use strict";

define([
        'game/GamePiece'
    ],
    function(
        GamePiece
    ) {


        var GameMain = function() {
            this.pieces = [];
            this.characters = [];
        };

        GameMain.prototype.registerGameCharacter = function(character) {
            if (this.characters.indexOf(character) === -1) {
                this.characters.push(character);
            }
            this.registerGamePiece(character.getGamePiece())
        };

        GameMain.prototype.registerGamePiece = function( gamePiece) {
            this.pieces.push(gamePiece);
        };


        GameMain.prototype.getPieceById = function(pieceId) {
            return MATH.getFromArrayByKeyValue(this.pieces, 'pieceId', pieceId);
        };

        GameMain.prototype.getPieces = function() {
            return this.pieces;
        };

        GameMain.prototype.getCharacters = function() {
            return this.characters;
        };

        GameMain.prototype.removeGamePiece = function(gamePiece) {

            var hasChar = MATH.getFromArrayByKeyValue(this.characters, 'gamePiece', gamePiece);

            if (hasChar) {
                MATH.quickSplice(this.characters, hasChar);
            }

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

