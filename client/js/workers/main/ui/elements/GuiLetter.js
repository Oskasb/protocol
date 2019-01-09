"use strict";

define([

    ],
    function(

    ) {

        var GuiLetter = function() {
            this.pos = new THREE.Vector3();
        };

        GuiLetter.prototype.initLetterBuffers = function(bufferElement) {

            this.bufferElement = bufferElement;

            this.bufferElement.lifecycle = {x:0.1, y:0.1, z:0.1, w:0.0};
            this.bufferElement.pos = {x:0, y:0, z:1};
            this.scale = {x:1, y:1, z:1};
            this.sprite = {x:0, y:0, z:0, w:0};
            this.pos.x = 0;
            this.pos.y = 0;
            this.pos.z = 0;

        //    this.bufferElement.setDefaultBuffers();

            // this.bufferElement.startLifecycleNow();

        };

        GuiLetter.prototype.setLetter = function(letter) {
            this.letter = letter;
        };

        GuiLetter.prototype.getLetter = function() {
            return this.letter;
        };

        GuiLetter.prototype.setSriteXY = function(x, y) {
            this.sprite.x = x;
            this.sprite.y = y;
            this.bufferElement.setSprite(this.sprite)
        };

        GuiLetter.prototype.setLetterPositionXYZ = function(x, y, z) {
            this.pos.x = x;
            this.pos.y = y;
            this.pos.z = z;
        };

        GuiLetter.prototype.applyLetterPosition = function() {
            this.bufferElement.setPositionVec3(this.pos)
        };

        GuiLetter.prototype.setLetterColorRGBA = function(rgba) {
            this.bufferElement.setColorRGBA(rgba)
        };

        GuiLetter.prototype.setLetterSprite = function(xyzw) {
            this.bufferElement.setSprite(xyzw)
        };

        GuiLetter.prototype.setLetterLutColor = function(value) {
            this.bufferElement.setLutColor(value);
            this.bufferElement.applyDataTexture()
        };

        GuiLetter.prototype.applyFontSizeAndHeight = function(fontSize, letterHeight) {
            this.setLetterScaleXY(fontSize * letterHeight * 10, fontSize * letterHeight * 10)
        };

        GuiLetter.prototype.setLetterScaleXY = function(x, y) {
            this.scale.x = x;
            this.scale.y = y;
            this.bufferElement.setScaleVec3(this.scale)
        };

        GuiLetter.prototype.setLetterReleaseTime = function(time) {
            this.bufferElement.setReleaseTime(time)
        };

        GuiLetter.prototype.releaseGuiLetter = function() {
            this.bufferElement.releaseElement()
        };


        return GuiLetter;

    });