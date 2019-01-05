"use strict";

define([

    ],
    function(

    ) {


    var sprites ={};
    var textLayouts = {};
    var settings = {};

        var GuiSettings = function() {
            settings = {
                sprites:sprites,
                textLayouts:textLayouts
            };
        };

        var fetchSetting = function(conf, key, dataId, cb) {

            if (!settings[key]) {
                settings[key] = {};
            }

            if (!settings[key][dataId]) {
                settings[key][dataId] = {};
            }

            var settingUpdate = function(src, data) {

                for (var i = 0; i < data.length; i ++) {
                    settings[key][src][data[i].id] = data[i];
                }
                console.log("SETTING:", src, settings);
                cb(src, settings[key][src]);
            };

            MainWorldAPI.fetchConfigData(conf, key, dataId, settingUpdate);
        };


        var fontSprites = function(src, data) {

            if (typeof (data) === 'undefined') {
                console.log("Bad data fetch;", src);
                return;
            }

            sprites[src] = {};
            for (var i = 0; i < data.length; i ++) {
                sprites[src][data[i].id] = [data[i].tiles[0][0], data[i].tiles[0][1]]
            }
            console.log("FONT SPRITES:", sprites[src]);
        };


        GuiSettings.prototype.initGuiSprite = function(key, dataId) {
            MainWorldAPI.fetchConfigData("ASSETS", key, dataId, fontSprites);
        };


        GuiSettings.prototype.loadUiConfig = function(key, dataId, cb) {
            fetchSetting("UI", key, dataId, cb)
        };


        GuiSettings.prototype.initGuiSettings = function(UI_SYSTEMS, onGuiSetting) {

            var systemDataCb = function(src, data) {
                onGuiSetting(src, data['gui_buffer']);
            };

            for (var i = 0; i < UI_SYSTEMS.length; i++) {
                fetchSetting("UI", "UI_SYSTEMS", UI_SYSTEMS[i], systemDataCb)
            }

        };


        GuiSettings.prototype.getUiSprites = function(key) {
            return sprites[key];
        };

        GuiSettings.prototype.getSettingData = function(setting, key, id) {
            return settings[setting][key][id];
        };

        GuiSettings.prototype.getSettingDataConfig = function(setting, key, id) {
            return settings[setting][key][id].config;
        };

        return GuiSettings;

    });