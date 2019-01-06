"use strict";

define([
        'client/js/workers/main/ui/states/ElementStateProcessor'
    ],
    function(
        ElementStateProcessor
    ) {

        var GuiSurface = function() {
            this.sprite = {x:7, y:0, z:0.0, w:0.0};
            this.scale  = {x:1.0, y:1.0, z:1.0};
            this.minXY = new THREE.Vector3();
            this.centerXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();

            this.surfaceState = ENUMS.ElementState.NONE;

            this.textElements = [];

        };

        GuiSurface.prototype.attachTextElement = function(textElement) {
            this.textElements.push(textElement);
        };

        GuiSurface.prototype.setBufferElement = function(bufferElement) {
            this.surfaceState = ENUMS.ElementState.NONE;
            this.bufferElement = bufferElement
        };

        GuiSurface.prototype.testIntersection = function(x, y) {

            if (x > this.minXY.x && x < this.maxXY.x && y > this.minXY.y && y < this.maxXY.y) {
                return true;
            }

        };

        GuiSurface.prototype.setSurfaceState = function(state) {
            this.surfaceState = state;
            this.applyStateFeedback();
        };

        GuiSurface.prototype.getSurfaceState = function() {
            return this.surfaceState;
        };

        GuiSurface.prototype.recoverGuiSurface = function() {
            while (this.textElements.length) {
                this.textElements.pop();
            }
            this.config = null;
            this.bufferElement.releaseElement()
        };

        GuiSurface.prototype.getBufferElement = function() {
            return this.bufferElement;
        };

        GuiSurface.prototype.setupSurfaceElement = function(config, callback) {

            this.config = config;

            var addSurfaceCb = function(bufferElem) {
                this.setBufferElement(bufferElem);
                this.applySurfaceConfig(this.config);
                callback(this)
            }.bind(this);

            GuiAPI.buildBufferElement(config.image.atlas_key, addSurfaceCb);

        };


        GuiSurface.prototype.surfaceOnHover = function(inputIndex) {
            GuiAPI.debugDrawRectExtents(this.minXY, this.maxXY);
        };

        GuiSurface.prototype.surfaceOnHoverEnd = function(inputIndex) {
            GuiAPI.debugDrawGuiPosition(this.centerXY.x, this.centerXY.y);
        };

        GuiSurface.prototype.surfaceOnPressStart = function(inputIndex) {
            GuiAPI.debugDrawRectExtents(this.minXY, this.maxXY);
        };

        GuiSurface.prototype.surfaceOnPressEnd = function(inputIndex) {
            GuiAPI.debugDrawGuiPosition(this.centerXY.x, this.centerXY.y);
        };

        GuiSurface.prototype.surfaceOnPressActivate = function(inputIndex) {
            GuiAPI.debugDrawGuiPosition(this.centerXY.x, this.centerXY.y);
        };

        GuiSurface.prototype.setSurfaceMinXY = function(vec3) {
            this.minXY.copy(vec3);;
        };

        GuiSurface.prototype.setSurfaceMaxXY = function(vec3) {
            this.maxXY.copy(vec3);;
        };

        GuiSurface.prototype.positionOnCenter = function() {
            this.centerXY.addVectors(this.minXY, this.maxXY);
            this.centerXY.multiplyScalar(0.5);
            this.setElementPosition(this.centerXY)
        };

        GuiSurface.prototype.applyPadding = function() {

            if (this.config.padding) {
                this.maxXY.x += this.config.padding.x;
                this.minXY.x -= this.config.padding.x;
                this.maxXY.y += this.config.padding.y;
                this.minXY.y -= this.config.padding.y;
            }

        };

        var extent;
        var stretch;
        var border;

        var calcNincesliceAxis = function(min, max, scale) {
            extent  = max - min;
            stretch = 0.5 * extent / scale; // stretch width of center quad
            border  = stretch * scale * 0.1/extent;  // The 0.1 appears in the mesh geometry used.. ??
            return stretch  - border; // + 0.025*this.scale.x) - (0.05*this.scale.x);
        };

        GuiSurface.prototype.configureNineslice = function() {

            this.sprite.w = calcNincesliceAxis(this.minXY.x, this.maxXY.x, this.scale.x);
            this.sprite.z = calcNincesliceAxis(this.minXY.y, this.maxXY.y, this.scale.y);

        };

        GuiSurface.prototype.fitToExtents = function() {

            this.applyPadding();

            this.configureNineslice();

            GuiAPI.debugDrawRectExtents(this.minXY, this.maxXY);

            this.bufferElement.setSprite(this.sprite);
            this.bufferElement.setScaleVec3(this.scale);

        };


        GuiSurface.prototype.setElementPosition = function(vec3) {
            this.bufferElement.setPositionVec3(vec3);
        };


        GuiSurface.prototype.applyStateFeedback = function() {
            ElementStateProcessor.applyElementStateFeedback(this, this.getSurfaceState());

            for (var i = 0; i < this.textElements.length; i++) {
                ElementStateProcessor.applyStateToTextElement(this.textElements[i], this.getSurfaceState());
            }

        };


        GuiSurface.prototype.applySurfaceConfig = function(config) {

            this.bufferElement.setAttackTime(0);
            this.bufferElement.setReleaseTime(0);
            this.applyStateFeedback();

            this.scale.x = config.image["border_thickness"].x;
            this.scale.y = config.image["border_thickness"].y;
        };

        return GuiSurface;

    });

