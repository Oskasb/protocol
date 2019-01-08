"use strict";

define([
        'client/js/workers/main/ui/states/ElementStateProcessor',
        'client/js/workers/main/ui/states/InteractiveElement'
    ],
    function(
        ElementStateProcessor,
        InteractiveElement
    ) {

        var GuiSurface = function() {
            this.sprite = {x:7, y:0, z:0.0, w:0.0};
            this.scale  = {x:1.0, y:1.0, z:1.0};
            this.minXY = new THREE.Vector3();
            this.centerXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();

            this.textElements = [];

            this.active = false;

            this.interactiveElement = new InteractiveElement(this);
        };

        GuiSurface.prototype.hasActivePointer = function(inputIndex) {
            if (this.interactiveElement.pressIndices.indexOf(inputIndex) !== -1) {
                return true;
            }
        };

        GuiSurface.prototype.toggleActive = function() {
            this.active = !this.active;
        };

        GuiSurface.prototype.getActive = function() {
            return this.active;
        };

        GuiSurface.prototype.getInteractiveElement = function() {
            return this.interactiveElement;
        };

        GuiSurface.prototype.attachTextElement = function(textElement) {
            if (this.textElements.indexOf(textElement) === -1) {
                this.textElements.push(textElement);
            }
        };

        GuiSurface.prototype.detachTextElement = function(textElement) {
            this.textElements.splice( this.textElements.indexOf(textElement) );
        };

        GuiSurface.prototype.setBufferElement = function(bufferElement) {
            this.bufferElement = bufferElement
        };

        GuiSurface.prototype.testIntersection = function(x, y) {

            if (x > this.minXY.x && x < this.maxXY.x && y > this.minXY.y && y < this.maxXY.y) {
                return true;
            }

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

        GuiSurface.prototype.setupSurfaceElement = function(configId, callback) {

            this.configId = configId;

            this.config =  GuiAPI.getGuiSettingConfig( "SURFACE_LAYOUT", "BACKGROUNDS", this.configId);

            var addSurfaceCb = function(bufferElem) {
                this.setBufferElement(bufferElem);
                this.applySurfaceConfig(this.config);
                callback(this)
            }.bind(this);

            GuiAPI.buildBufferElement(this.config.image.atlas_key, addSurfaceCb);
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

        //    GuiAPI.debugDrawRectExtents(this.minXY, this.maxXY);

            this.bufferElement.setSprite(this.sprite);
            this.bufferElement.setScaleVec3(this.scale);

        };


        GuiSurface.prototype.setElementPosition = function(vec3) {
            this.bufferElement.setPositionVec3(vec3);
        };


        var state;
        GuiSurface.prototype.applyStateFeedback = function() {

            this.applySurfaceConfig();

            state = this.getInteractiveElement().getInteractiveElementState();
            ElementStateProcessor.applyElementStateFeedback(this, state);

            for (var i = 0; i < this.textElements.length; i++) {
                ElementStateProcessor.applyStateToTextElement(this.textElements[i], state);
            }

        };


        GuiSurface.prototype.applySurfaceConfig = function() {

            this.config =  GuiAPI.getGuiSettingConfig( "SURFACE_LAYOUT", "BACKGROUNDS", this.configId);

            this.bufferElement.setAttackTime(0);
            this.bufferElement.setReleaseTime(0);

            this.scale.x = this.config.image["border_thickness"].x;
            this.scale.y = this.config.image["border_thickness"].y;
        };

        return GuiSurface;

    });

