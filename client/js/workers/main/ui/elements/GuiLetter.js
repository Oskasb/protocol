"use strict";

define([

    ],
    function(

    ) {

        var GuiLetter = function() {
            this.pos = new THREE.Vector3();
            this.scale = {x:0, y:0, z:0};
            this.sprite = {x:0, y:0, z:0, w:0};
        };

        GuiLetter.prototype.initLetterBuffers = function(bufferElement) {

            this.bufferElement = bufferElement;
            this.scale.x = 0;
            this.scale.y = 0;
            this.scale.z = 0;
            this.bufferElement.pos.x = 0;
            this.bufferElement.pos.y = 0;
            this.bufferElement.pos.z = 1;

            this.bufferElement.lifecycle.x = 0;
            this.bufferElement.lifecycle.y = 0;
            this.bufferElement.lifecycle.z = 0;
            this.bufferElement.lifecycle.w = 0;

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

        GuiLetter.prototype.applyLetterHeight = function(letterHeight) {
            this.setLetterScaleXY(letterHeight * 10, letterHeight * 10)
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