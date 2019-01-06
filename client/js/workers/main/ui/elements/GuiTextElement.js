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





            var addElement = function(sysKey, callback) {
                var element = new GuiString();
                callback(element)
            };

            this.expandingPool = new ExpandingPool('strings', addElement);
        };

        GuiTextElement.prototype.drawTextString = function(uiSysKey, string, cb) {


            var initString = function(guiString) {
                guiString.setString(string, uiSysKey);
                this.guiStrings.push(guiString);
                cb(this);
            }.bind(this);


            var getElement = function(elem) {
                initString(elem)
            };


            var sconf = GuiAPI.getGuiSettingConfig( "SURFACE_LAYOUT", "BACKGROUNDS", "surface_default")


            var surfaceReady = function(surface) {
            //    console.log("surface ready",surface)

                this.expandingPool.getFromExpandingPool(getElement)
            }.bind(this);
            GuiAPI.registerInteractiveGuiElement(this.guiSurface);
            this.guiSurface.setupSurfaceElement( sconf , surfaceReady);

            var onHover = function() {

            };

        };

        GuiTextElement.prototype.setElementPosition = function(vec3, txtLayout) {

            this.guiSurface.setSurfaceMinXY(vec3);

            for (var i = 0; i < this.guiStrings.length; i++) {
                this.guiStrings[i].setStringPosition(vec3, txtLayout);
                this.guiSurface.setSurfaceMaxXY(this.guiStrings[i].maxXY);
            }

            this.guiSurface.positionOnCenter();
            this.guiSurface.fitToExtents();
        };

        GuiTextElement.prototype.recoverTextElement = function() {

            while (this.guiStrings.length) {

                var guiString = this.guiStrings.pop();
                guiString.recoverGuiString();
                this.expandingPool.returnToExpandingPool(guiString);
            }

            GuiAPI.unregisterInteractiveGuiElement(this.guiSurface);
            this.guiSurface.recoverBufferElement();

        };

        return GuiTextElement;

    });