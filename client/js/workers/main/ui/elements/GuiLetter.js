"use strict";

define([

    ],
    function(

    ) {

        var GuiLetter = function(element) {
            this.bufferElement = element;
            this.pos = new THREE.Vector3();
        };

        GuiLetter.prototype.setLetter = function(letter) {
            this.letter = letter;
        };

        GuiLetter.prototype.getLetter = function() {
            return this.letter;
        };

        GuiLetter.prototype.getLetterPosition = function() {
            return this.pos;
        };

        GuiLetter.prototype.setLetterPositionXYZ = function(x, y, z) {
            this.pos.x = x;
            this.pos.y = y;
            this.pos.z = z;
        };

        GuiLetter.prototype.applyLetterPosition = function() {
            this.bufferElement.setPositionVec3(this.pos)
        };

        GuiLetter.prototype.setLetterSprite = function(xyzw) {
            this.bufferElement.setSprite(xyzw)
        };

        GuiLetter.prototype.setLetterScale = function(vec3) {
            this.bufferElement.setScaleVec3(vec3)
        };

        GuiLetter.prototype.releaseGuiLetter = function() {
            this.bufferElement.releaseElement()
        };


        return GuiLetter;

    });