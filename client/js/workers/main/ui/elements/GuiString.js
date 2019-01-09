"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiLetter'
    ],
    function(
        ExpandingPool,
        GuiLetter
    ) {

        var letterPools = {};

        var fetch = function(sysKey, cb) {

            var addLetterCb = function(bufferElem) {

                var letter = new GuiLetter();
                letter.initLetterBuffers(bufferElem);
                cb(letter)
            };

            GuiAPI.buildBufferElement(sysKey, addLetterCb)
        };


        var createLetter = function(guiSysId, letter, index, cb) {

            var getLetter = function(guiLetter) {
                cb(guiLetter, letter, index);
            };

            letterPools[guiSysId].getFromExpandingPool(getLetter);

        };


        var GuiString = function() {

            this.minXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();
            this.centerXY = new THREE.Vector3();
        };

        GuiString.prototype.setString = function(string, guiSysId, fontSize) {

            if (!letterPools[guiSysId]) {
                letterPools[guiSysId] = new ExpandingPool(guiSysId, fetch)
            }

            this.guiSysId = guiSysId;
            this.fontSize = fontSize;

            this.setupLetters(string, guiSysId);

        };


        var sprite = {x:7, y:0, z:0.0, w:0.0};

        var lifecycle = {x:0, y:0, z:0, w:0.25};


        GuiString.prototype.setupLetters = function(string, guiSysId) {

            this.letters = [];

            var addLetter = function(guiLetter, letter, index) {
                this.letters[index] = guiLetter;
                guiLetter.setLetter(letter);
                adds--;
                if (!adds) {
                    this.applyStringData();
                }
            }.bind(this);

            var adds = string.length;

            for (var i = 0; i < string.length; i++) {
                createLetter(guiSysId, string[i], i, addLetter);
            }

        };

        GuiString.prototype.recoverGuiString = function() {

            while (this.letters.length) {

                var letter = this.letters.pop();
                letter.releaseGuiLetter();
            //    this.expandingPool.returnToExpandingPool(letter);
            }
        };

        GuiString.prototype.applyStringData = function() {

            var spriteKey = GuiAPI.getTextSystem().getSpriteKey();
            var fontSprites = GuiAPI.getUiSprites(spriteKey);
            var letterSprite;

            for (var i = 0; i < this.letters.length; i++) {
                var guiLetter = this.letters[i];

                var letter = guiLetter.getLetter();

                letterSprite = fontSprites[letter];
                if (!letterSprite) {
                    sprite.x = 1;
                    sprite.y = 1;
                } else {
                    sprite.x = letterSprite[0];
                    sprite.y = letterSprite[1];
                }


                guiLetter.setLetterSprite(sprite);
            }

        //    this.setStringPosition(this.rootPosition)
        };


        GuiString.prototype.setStringPosition = function(vec3, letterWidth, letterHeight, rowSpacing, row) {
            this.minXY.copy(vec3);
            this.minXY.y += this.fontSize*row*rowSpacing + this.fontSize*row*letterHeight;
            this.maxXY.copy(this.minXY);
            for (var i = 0; i < this.letters.length; i++) {
                var guiLetter = this.letters[i];
                this.applyRootPositionToLetter(i, guiLetter, letterWidth, letterHeight, rowSpacing, row);
            }
            this.maxXY.x += this.fontSize*letterWidth*0.5;
        };


        GuiString.prototype.applyRootPositionToLetter = function(index, guiLetter, letterWidth, letterHeight, rowSpacing, row) {


            guiLetter.applyFontSizeAndHeight(this.fontSize ,letterHeight);

            this.maxXY.x = this.minXY.x + index * this.fontSize*letterWidth + this.fontSize*letterWidth*0.5;

            this.maxXY.y = this.minXY.y + this.fontSize*letterHeight;

            this.centerXY.addVectors(this.minXY, this.maxXY).multiplyScalar(0.5);

            guiLetter.setLetterPositionXYZ(this.maxXY.x, this.centerXY.y, this.minXY.z);

        //    GuiAPI.debugDrawGuiPosition(guiLetter.pos.x, guiLetter.pos.y );

            guiLetter.applyLetterPosition()
        };


        GuiString.prototype.setStringColorRGBA = function(rgba, lutColor) {

            for (var i = 0; i < this.letters.length; i++) {
                var guiLetter = this.letters[i];
                guiLetter.setLetterColorRGBA(rgba);
                guiLetter.setLetterLutColor(ENUMS.ColorCurve[lutColor]);
            }

        };


        return GuiString;

    });