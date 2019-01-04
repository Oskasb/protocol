"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiString'
    ],
    function(
        ExpandingPool,
        GuiString
    ) {

        var GuiTextElement = function() {

            this.guiStrings = [];

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
                cb(guiString);
            }.bind(this);


            var getElement = function(elem) {
                initString(elem)
            };

            this.expandingPool.getFromExpandingPool(getElement)

        };



        GuiTextElement.prototype.setElementPosition = function(vec3) {

            for (var i = 0; i < this.guiStrings.length; i++) {
                this.guiStrings[i].setStringPosition(vec3);
            }

        };

        GuiTextElement.prototype.recoverTextElement = function() {

            while (this.guiStrings.length) {

                var guiString = this.guiStrings.pop();
                guiString.recoverGuiString();
                this.expandingPool.returnToExpandingPool(guiString);

            }

        };


        return GuiTextElement;

    });