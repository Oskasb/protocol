"use strict";

define([
        'client/js/workers/main/ui/elements/GuiLetter',
        'application/ExpandingPool'
    ],
    function(
        GuiLetter,
        ExpandingPool
    ) {

        var i;
        var tempVec1 = new THREE.Vector3();

        var createLetter = function(guiSysId, letter, index, cb) {

            var fetch = function(guiLetter) {

            //    var guiLetter = new GuiLetter();

                var bufferCB = function(bufferElement) {
                    guiLetter.initLetterBuffers(bufferElement);
                    cb(guiLetter, letter, index);
                };

                GuiAPI.buildBufferElement(guiSysId, bufferCB)

            };

            letterPools[guiSysId].getFromExpandingPool(fetch)
        };


        var buildLetter = function(guiSysId, letterReadyCB) {

            var bufferCb = function(bufferElem) {
                letterReadyCB(new GuiLetter())
            };

        };

        var letterPools = {};


        var GuiString = function() {
            this.minXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();
            this.centerXY = new THREE.Vector3();
            this.letters = [];
        };


        GuiString.prototype.setString = function(string, guiSysId) {

            if (!letterPools[guiSysId]) {
                letterPools[guiSysId]= new ExpandingPool(guiSysId, buildLetter)
            }

            this.guiSysId = guiSysId;
            this.setupLetters(string);

        };

        var s;

        GuiString.prototype.setupLetters = function(string) {


            var addLetter = function(guiLetter, letter, index) {
                this.letters[index] = guiLetter;
                guiLetter.setLetter(letter);
                adds--;
                if (!adds) {
                    this.applyStringData();
                }
            }.bind(this);

            var adds = string.length;

            for (s = 0; s < string.length; s++) {
                createLetter(this.guiSysId, string[s], s, addLetter);
            }

        };

        GuiString.prototype.recoverGuiString = function() {

            while (this.letters.length) {
                var letter = this.letters.pop();
                letter.releaseGuiLetter();
                letterPools[this.guiSysId].returnToExpandingPool(letter)
            }
        }

        var scale = {x:0.4, y:0.4, z:1.0};

        var ia;

        GuiString.prototype.applyStringData = function() {

            var spriteKey = GuiAPI.getTextSystem().getSpriteKey();
            var fontSprites = GuiAPI.getUiSprites(spriteKey);
            var letterSprite;

            for (ia = 0; ia < this.letters.length; ia++) {
                var guiLetter = this.letters[ia];

                var letter = guiLetter.getLetter();

                guiLetter.initLetterBuffers();
                letterSprite = fontSprites[letter];

                guiLetter.setLetterScale(scale);
                guiLetter.setSriteXY(letterSprite[0], letterSprite[1]);

            }

        };

        var l;

        GuiString.prototype.setStringPosition = function(vec3, letterWidth, letterHeight, rowSpacing, row) {
            this.minXY.copy(vec3);
            this.minXY.y += row*rowSpacing + row*letterHeight;
            this.maxXY.copy(this.minXY);
            for (l = 0; l < this.letters.length; l++) {
                var guiLetter = this.letters[l];
                this.applyRootPositionToLetter(l, guiLetter, letterWidth, letterHeight, rowSpacing, row);
            }
            this.maxXY.x += letterWidth*0.5;
        };

        GuiString.prototype.applyRootPositionToLetter = function(index, guiLetter, letterWidth, letterHeight, rowSpacing, row) {


            this.maxXY.x = this.minXY.x + index * letterWidth + letterWidth*0.5;

            this.maxXY.y = this.minXY.y + letterHeight;

            this.centerXY.addVectors(this.minXY, this.maxXY).multiplyScalar(0.5);

            guiLetter.setLetterPositionXYZ(this.maxXY.x, this.centerXY.y, this.minXY.z);

        //    GuiAPI.debugDrawGuiPosition(guiLetter.pos.x, guiLetter.pos.y );

            guiLetter.applyLetterPosition()
        };


        var c;

        GuiString.prototype.setStringColorRGBA = function(rgba) {

            for (c = 0; c < this.letters.length; c++) {
                 this.letters[c].setLetterColorRGBA(rgba);;
            }

        };

        GuiString.prototype.setLetterScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        return GuiString;

    });