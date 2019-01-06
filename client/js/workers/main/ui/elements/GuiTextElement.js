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



            var sconf = GuiAPI.getGuiSettingConfig( "SURFACE_LAYOUT", "BACKGROUNDS", "surface_default")


            var surfaceReady = function(surface) {
            //    console.log("surface ready",surface)

                var initString = function(guiString) {
                    guiString.setString(string, uiSysKey);
                    this.guiStrings.push(guiString);
                    surface.applyStateFeedback();
                    cb(this);
                }.bind(this);


                var getElement = function(elem) {
                    initString(elem)
                };


                surface.attachTextElement(this);
                this.expandingPool.getFromExpandingPool(getElement)
            }.bind(this);

            GuiAPI.registerInteractiveGuiElement(this.guiSurface);
            this.guiSurface.setupSurfaceElement( sconf , surfaceReady);

            var onHover = function() {

            };

        };

        GuiTextElement.prototype.setElementConfig = function(config) {
            this.config = config;
        }

        GuiTextElement.prototype.setElementPosition = function(vec3) {



            this.guiSurface.setSurfaceMinXY(vec3);

            for (var i = 0; i < this.guiStrings.length; i++) {
                this.guiStrings[i].setStringPosition(vec3, this.config['letter_width'], this.config['letter_height']);
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
            this.guiSurface.recoverGuiSurface();

        };

        return GuiTextElement;

    });