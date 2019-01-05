"use strict";

define([
        'client/js/workers/main/ui/elements/GuiLetter'
    ],
    function(
        GuiLetter
    ) {

    var tempVec1 = new THREE.Vector3();

        var GuiString = function() {
            this.rootPosition = new THREE.Vector3();
        };


        GuiString.prototype.setString = function(string, guiSysId) {
            this.guiSysId = guiSysId;
            this.rootPosition.x = 0.0;
            this.rootPosition.y = 0.0;
            this.rootPosition.z = -1;

            this.setupLetters(string, guiSysId);

        };

        var sprite = {x:7, y:0, z:0.0, w:0.0};
        var scale = {x:0.4, y:0.4, z:1.0};
        var lifecycle = {x:0, y:0, z:0, w:0.25};

        var createLetter = function(guiSysId, letter, index, cb) {

            var addLetterCb = function(bufferElem) {
                var guiLetter = new GuiLetter(bufferElem);
                cb(guiLetter, letter, index);
            }.bind(this);

            GuiAPI.buildBufferElement(guiSysId, addLetterCb)
        };



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
            var fontSprites = GuiAPI.getFontSprites(spriteKey);
            var letterSprite;

            for (var i = 0; i < this.letters.length; i++) {
                var guiLetter = this.letters[i];

                var letter = guiLetter.getLetter();

                letterSprite = fontSprites[letter];
                if (!letterSprite) {
                    sprite.x = 2;
                    sprite.y = 2;
                } else {
                    sprite.x = letterSprite[0];
                    sprite.y = letterSprite[1];
                }

                guiLetter.setLetterScale(scale);
                guiLetter.setLetterSprite(sprite);
            }

        //    this.setStringPosition(this.rootPosition)

        };

        GuiString.prototype.setStringPosition = function(vec3) {
            for (var i = 0; i < this.letters.length; i++) {
                var guiLetter = this.letters[i];
                this.applyRootPositionToLetter(vec3, i, guiLetter);
            }
        };

        GuiString.prototype.applyRootPositionToLetter = function(vec3, index, guiLetter) {
            tempVec1.x = vec3.x + index*0.02;
            tempVec1.y = vec3.y;
            tempVec1.z = vec3.z;

            guiLetter.setLetterPosition(tempVec1);
            guiLetter.applyLetterPosition()
        };

        GuiString.prototype.setLetterScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        return GuiString;

    });