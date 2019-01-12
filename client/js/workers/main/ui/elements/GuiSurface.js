"use strict";

define([
        'client/js/workers/main/ui/states/InteractiveElement'
    ],
    function(
        InteractiveElement
    ) {

        var GuiSurface = function() {
            this.sprite = {x:7, y:0, z:0.0, w:0.0};
            this.scale  = {x:1.0, y:1.0, z:1.0};

            this.centerXY = new THREE.Vector3();

            this.minXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();

            this.active = false;

            this.onUpdateCallbacks = [];

            this.interactiveElement = new InteractiveElement(this);
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


        GuiSurface.prototype.setBufferElement = function(bufferElement) {
            this.bufferElement = bufferElement
        };

        GuiSurface.prototype.testIntersection = function(x, y) {

            if (x > this.minXY.x && x < this.maxXY.x && y > this.minXY.y && y < this.maxXY.y) {
                return true;
            }

        };

        GuiSurface.prototype.recoverGuiSurface = function() {

            this.config = null;
            this.bufferElement.releaseElement();

            while (this.onUpdateCallbacks.length) {
                this.onUpdateCallbacks.pop();
            }

        };

        GuiSurface.prototype.getBufferElement = function() {
            return this.bufferElement;
        };

        GuiSurface.prototype.setupSurfaceElement = function(configId, callback) {

            this.configId = configId;

            this.config =  GuiAPI.getGuiSettingConfig( "SURFACE_NINESLICE", "GUI_16x16", this.configId);

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

            this.bufferElement.setSprite(this.sprite);
            this.bufferElement.setScaleVec3(this.scale);

        };

        GuiSurface.prototype.fitToExtents = function() {

            this.applyPadding();

            this.configureNineslice();

        //    GuiAPI.debugDrawRectExtents(this.minXY, this.maxXY);

        };


        GuiSurface.prototype.setElementPosition = function(vec3) {
            this.bufferElement.setPositionVec3(vec3);
        };

        GuiSurface.prototype.setFeedbackConfigId = function(feedbackConfigId) {
            this.feedbackConfigId = feedbackConfigId;
        };

        GuiSurface.prototype.getFeedbackConfigId = function() {
            return this.feedbackConfigId;
        };

        GuiSurface.prototype.getInteractiveState = function() {
            return this.getInteractiveElement().getInteractiveElementState();
        };

        GuiSurface.prototype.registerStateUpdateCallback = function(cb) {
            this.onUpdateCallbacks.push(cb);
        };

        GuiSurface.prototype.notifyStateUpdated = function() {
            for (var i = 0; i < this.onUpdateCallbacks.length; i++) {
                this.onUpdateCallbacks[i]();
            }

        };


        GuiSurface.prototype.applyStateFeedback = function() {

            this.applySurfaceConfig();
            this.notifyStateUpdated();

        };

        GuiSurface.prototype.applySurfaceConfig = function() {

            this.config =  GuiAPI.getGuiSettingConfig( "SURFACE_NINESLICE", "GUI_16x16", this.configId);

            this.bufferElement.setAttackTime(0);
            this.bufferElement.setReleaseTime(0);

            this.scale.x = this.config.image["border_thickness"].x;
            this.scale.y = this.config.image["border_thickness"].y;
        };

        return GuiSurface;

    });

