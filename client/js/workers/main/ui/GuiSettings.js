"use strict";

define([

    ],
    function(

    ) {


    var fonts ={};
    var textLayouts = {};



        var GuiSettings = function() {
            this.settings = {
                fonts:fonts,
                textLayouts:textLayouts
            };
        };

        GuiSettings.prototype.initGuiSettings = function() {

            var fontSprites = function(src, data) {

                fonts[src] = {};
                for (var i = 0; i < data.length; i ++) {
                    fonts[src][data[i].id] = [data[i].tiles[0][0], data[i].tiles[0][1]]
                }
                console.log("FONT SPRITES:", fonts[src]);
            };

            MainWorldAPI.fetchConfigData("ASSETS", "SPRITES", "FONT_16x16", fontSprites);


            var textLayout = function(src, data) {

                textLayouts[src] = {};
                for (var i = 0; i < data.length; i ++) {
                    textLayouts[src][data[i].id] = data[i].config
                }
                console.log("TEXT_LAYOUT:", textLayouts[src]);
            };

            MainWorldAPI.fetchConfigData("UI", "TEXT_LAYOUT", "FONT_16x16", textLayout);


        };

        GuiSettings.prototype.getLetter = function() {

            return this.letter;

        };

        GuiSettings.prototype.getFontSprites = function(key) {
            return fonts[key];
        };

        GuiSettings.prototype.getSetting = function(setting, key, id) {
            return this.settings[setting][key][id];
        };


        return GuiSettings;

    });