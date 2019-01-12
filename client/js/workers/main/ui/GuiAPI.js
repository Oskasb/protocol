"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/GuiSettings',
        'client/js/workers/main/ui/GuiBuffers',
        'client/js/workers/main/ui/systems/GuiDebug',
        'client/js/workers/main/ui/elements/GuiBufferElement'
    ],
    function(
        ExpandingPool,
        GuiSettings,
        GuiBuffers,
        GuiDebug,
        GuiBufferElement
    ) {

        var i;
        var inputs;
        var ib;
        var guiSystems = [];

        var elementPools = {};

        var inputSystem;
        var textSystem;


        var guiSettings = new GuiSettings();


        var basicText;
        var txtSysKey = 'FONT_16x16';

        var guiUpdateCallbacks = [];
        var inputUpdateCallbacks = [];

        var guiBuffers = {};


        var GuiAPI = function() {

        };

        var addUiSystem = function(sysKey, spriteKey, assetName, poolSize, renderOrder) {

            guiBuffers[spriteKey] = new GuiBuffers(spriteKey, assetName, poolSize, renderOrder);

            var addElement = function(sysKey, callback) {
                var element = new GuiBufferElement();
                callback(sysKey, element)
            };
            elementPools[spriteKey] = new ExpandingPool(spriteKey, addElement);
        };


        GuiAPI.initGuiApi = function(onReadyCB) {

            var reqs = 0;
            var loads = 0;

            var loadCb = function() {
                loads++
                if (loads === reqs) {
                    onReadyCB();
                }
            };

            var loadUiConfig = function(key, dataId) {
                reqs++;
                guiSettings.loadUiConfig(key, dataId, loadCb);
            };

            guiSettings.initGuiSprite("SPRITES", "FONT_16x16");
            guiSettings.initGuiSprite("SPRITES", "ATLAS_6x6");
            guiSettings.initGuiSprite("SPRITES", "GUI_16x16");

            loadUiConfig("SURFACE_LAYOUT", "SURFACES");
            loadUiConfig("TEXT_LAYOUT", "TEXTS");

            loadUiConfig("WIDGET", "STANDARD_WIDGETS");
            loadUiConfig("FEEDBACK", "SURFACE");
            loadUiConfig("FEEDBACK", "TEXT");
            loadUiConfig("SPRITE_FONT", "FONT_16x16");
            loadUiConfig("SURFACE_NINESLICE", "GUI_16x16");

        };

        GuiAPI.addUiSystem = addUiSystem;

        var registeredTextElements = {};

        GuiAPI.registerTextSurfaceElement = function(elemKey, txtElem) {
            registeredTextElements[elemKey] = txtElem;
            textSystem.addTextElement(txtElem);
        };

        GuiAPI.setInputSystem = function(inputSys) {
            inputSystem = inputSys;
        };



        GuiAPI.getInputSystem = function() {
            return inputSystem;
        };

        GuiAPI.setTextSystem = function(txtSys) {
            textSystem = txtSys;
        };

        GuiAPI.getTextSystem = function() {
            return textSystem;
        };

        GuiAPI.getGuiDebug = function() {
            return GuiDebug;
        };

        GuiAPI.getUiSprites = function(spriteKey) {
            return guiSettings.getUiSprites(spriteKey);
        };

        GuiAPI.getGuiSettings = function() {
            return guiSettings;
        };

        GuiAPI.getGuiSettingConfig = function(uiKey, dataKey, dataId) {
            return guiSettings.getSettingDataConfig(uiKey, dataKey, dataId);
        };

        var updateBufferIndices = function() {
            for (var key in guiBuffers) {
                guiBuffers[key].updateGuiBuffer()
            }
        };

        GuiAPI.buildBufferElement = function(spriteKey, cb) {

            var getElement = function(key, elem) {
                elem.initGuiBufferElement(guiBuffers[key]);
                cb(elem);
            };
            elementPools[spriteKey].getFromExpandingPool(getElement)
        };

        GuiAPI.debugDrawGuiPosition = function(x, y) {
            GuiDebug.debugDrawPoint(x, y)
        };

        GuiAPI.debugDrawRectExtents = function(minVec, maxVec) {
            GuiDebug.drawRectExtents(minVec, maxVec)
        };

        GuiAPI.printDebugText = function(string) {
            GuiDebug.addDebugTextString(string)
        };


        GuiAPI.registerInteractiveGuiElement = function(surfaceElement) {
            inputSystem.registerInteractiveSurfaceElement(surfaceElement)
        };

        GuiAPI.unregisterInteractiveGuiElement = function(surfaceElement) {
            inputSystem.unregisterInteractiveSurfaceElement(surfaceElement)
        };

        GuiAPI.activateGuiElement = function() {

        };

        GuiAPI.activateDefaultGui = function() {

        };

        GuiAPI.registerCallback = function() {

        };

        GuiAPI.addInputUpdateCallback = function(cb) {
            inputUpdateCallbacks.push(cb);
        };

        GuiAPI.removeInputUpdateCallback = function(cb) {
            inputUpdateCallbacks.splice(inputUpdateCallbacks.indexOf(cb), 1);
        };

        GuiAPI.addGuiUpdateCallback = function(cb) {
            guiUpdateCallbacks.push(cb);
        };

        GuiAPI.removeGuiUpdateCallback = function(cb) {
            guiUpdateCallbacks.splice(guiUpdateCallbacks.indexOf(cb), 1);
        };

        var cbs;

        var callInputUpdateCallbacks = function(input, buffer) {
            for (cbs = 0; cbs < inputUpdateCallbacks.length; cbs++) {
                inputUpdateCallbacks[cbs](input, buffer);
            }
        };

        var idx;

        var updateInput = function(INPUT_BUFFER) {
            inputs = ENUMS.Numbers.POINTER_TOUCH0 + ENUMS.Numbers.TOUCHES_COUNT;
            for (ib = 0; ib < inputs; ib++) {
                idx = ib*ENUMS.InputState.BUFFER_SIZE + ENUMS.InputState.HAS_UPDATE;
                if (INPUT_BUFFER[idx]) {
                    callInputUpdateCallbacks(ib, INPUT_BUFFER)
                }
            }
        };


        var dymmy1 = function(textWidget) {
            textWidget.printWidgetText("MOO "+Math.random(), 7)
        };


        GuiAPI.getTextSysKey = function() {
            return txtSysKey;
        };

        GuiAPI.updateGui = function(INPUT_BUFFER, tpf, time) {

            GuiDebug.updateDebugElements();
            updateBufferIndices();
            updateInput(INPUT_BUFFER);


            if (registeredTextElements['main_text_box']) {
                dymmy1(registeredTextElements['main_text_box']);
            }


            for (i = 0; i < guiUpdateCallbacks.length; i++) {
                guiUpdateCallbacks[i](tpf, time);
            }

        };

        return GuiAPI;

    });