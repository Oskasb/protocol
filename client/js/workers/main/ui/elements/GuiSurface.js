"use strict";

define([

    ],
    function(

    ) {

        var GuiSurface = function() {
            this.sprite = {x:7, y:0, z:0.0, w:0.0};
            this.scale  = {x:1.0, y:1.0, z:1.0};
            this.minXY = new THREE.Vector3();
            this.centerXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();

        };


        GuiSurface.prototype.setBufferElement = function(bufferElement) {

            this.bufferElement = bufferElement

        };

        GuiSurface.prototype.recoverBufferElement = function() {

            this.bufferElement.releaseElement()
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


            GuiAPI.debugDrawGuiPosition(this.minXY.x, this.minXY.y);
            GuiAPI.debugDrawGuiPosition(this.maxXY.x, this.maxXY.y);
            GuiAPI.debugDrawGuiPosition(this.minXY.x, this.maxXY.y);
            GuiAPI.debugDrawGuiPosition(this.maxXY.x, this.minXY.y);

            this.bufferElement.setSprite(this.sprite);
            this.bufferElement.setScaleVec3(this.scale);

        };

        GuiSurface.prototype.setElementPosition = function(vec3) {

            this.bufferElement.setPositionVec3(vec3);
        };


        GuiSurface.prototype.applySurfaceConfig = function(config) {

            var sprites = GuiAPI.getUiSprites(config.image.atlas_key);
            var sprite = sprites[config.image.sprite];

            this.sprite.x = sprite[0];
            this.sprite.y = sprite[1];

            this.scale.x = config.image["border_thickness"].x;
            this.scale.y = config.image["border_thickness"].y;
        };

        return GuiSurface;

    });

