"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiString',
        'client/js/workers/main/ui/elements/GuiSurface'
    ],
    function(
        ExpandingPool,
        GuiString,
        GuiSurface
    ) {

        var GuiTextElement = function() {

            this.guiStrings = [];
            this.guiSurface = new GuiSurface();

            this.anchorPosVec = new THREE.Vector3();

            var addElement = function(sysKey, callback) {
                var element = new GuiString();
                callback(element)
            };

            this.guiStringPool = new ExpandingPool('strings', addElement);
        };

        GuiTextElement.prototype.removeGuiString = function(guiString) {

            guiString.recoverGuiString();
            this.guiStringPool.returnToExpandingPool(guiString);

        };

        GuiTextElement.prototype.drawTextString = function(uiSysKey, string, fontSize) {


            var initString = function(guiString, surface) {

                guiString.setString(string, uiSysKey, fontSize);
                this.guiStrings.push(guiString);
                surface.applyStateFeedback();
                this.updateElementPosition()

            }.bind(this);

            var surfaceReady = function(surface) {
            //    console.log("surface ready",surface)

                if (this.guiStrings.length > 4) {
                    this.removeGuiString(this.guiStrings.shift())
                }

                var getElement = function(elem) {
                    initString(elem, surface)
                };

                surface.attachTextElement(this);
                this.guiStringPool.getFromExpandingPool(getElement)

            }.bind(this);

            if (this.guiSurface.config) {

                surfaceReady(this.guiSurface);
                return;
            }

            GuiAPI.registerInteractiveGuiElement(this.guiSurface);

            var sconf = GuiAPI.getGuiSettingConfig( "SURFACE_LAYOUT", "BACKGROUNDS", "surface_default")

            this.guiSurface.setupSurfaceElement( sconf , surfaceReady);

        };

        GuiTextElement.prototype.setElementDataKeys = function(uiKey, dataKey, dataId) {
            this.uiKey = uiKey;
            this.dataKey = dataKey;
            this.dataId = dataId;
            var config = GuiAPI.getGuiSettingConfig(this.uiKey, this.dataKey, this.dataId);
            this.setElementConfig(config);
        };

        GuiTextElement.prototype.setElementConfig = function(config) {
            this.config = config;
        };


        GuiTextElement.prototype.setElementAnchorPos = function(posV) {
            this.anchorPosVec.copy(posV);
        };

        GuiTextElement.prototype.updateElementPosition = function() {

            this.config = GuiAPI.getGuiSettingConfig(this.uiKey, this.dataKey, this.dataId);

            this.guiSurface.setSurfaceMinXY(this.anchorPosVec);
            this.guiSurface.setSurfaceMaxXY(this.anchorPosVec);

                var letterW = this.config['letter_width'];
                var letterH = this.config['letter_height'];

                var maxW = 0;
                var maxH = 0;

            for (var i = 0; i < this.guiStrings.length; i++) {

                this.guiStrings[i].setStringPosition(this.anchorPosVec, letterW, letterH, this.config['row_spacing'], i);

                if (this.guiStrings[i].maxXY.x > maxW) {
                    maxW = this.guiStrings[i].maxXY.x;
                }

                maxH = this.guiStrings[i].maxXY.y

            }

            // this.guiSurface.minXY.y = maxH //letterH/2;

            this.guiSurface.maxXY.x = maxW;
            this.guiSurface.maxXY.y = maxH ;

            this.guiSurface.positionOnCenter();
            this.guiSurface.fitToExtents();
        };

        GuiTextElement.prototype.recoverTextElement = function() {

            while (this.guiStrings.length) {

                var guiString = this.guiStrings.shift();
                guiString.recoverGuiString();
                this.guiStringPool.returnToExpandingPool(guiString);
            }

            GuiAPI.unregisterInteractiveGuiElement(this.guiSurface);
            this.guiSurface.recoverGuiSurface();

        };

        return GuiTextElement;

    });