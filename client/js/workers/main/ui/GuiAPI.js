"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/GuiSettings',
        'client/js/workers/main/ui/GuiBuffers',
        'client/js/workers/main/ui/systems/GuiDebug',
        'client/js/workers/main/ui/systems/InputSystem',
        'client/js/workers/main/ui/systems/TextSystem',
        'client/js/workers/main/ui/elements/GuiBufferElement'
    ],
    function(
        ExpandingPool,
        GuiSettings,
        GuiBuffers,
        GuiDebug,
        InputSystem,
        TextSystem,
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

        var systemReady = function(guiSystem) {

            if (guiSystems.indexOf(guiSystem) === -1) {
                guiSystems.push(guiSystem);
            }
        };


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


        var defaultTextCB = function(txtElem) {
            basicText = txtElem;

            var surfaceReady = function() {
                textSystem.addTextElement( basicText );
            };

            basicText.setupTextSurface("surface_default", surfaceReady)
        };

        var textSysCb = function() {

            var dummyTxtPos = new THREE.Vector3(-0.5, -0.3, -1);

            textSystem.buildTextElement(defaultTextCB, "default_text_layout", dummyTxtPos);

            var debugTextPos = new THREE.Vector3(0.3, 0.3, -1);
            GuiDebug.addDebugTextPanel("debug_text", debugTextPos)
        };

        var inputReady = function() {
            textSystem = new TextSystem();
            textSystem.initTextSystem(textSysCb);
        };

        var configsLoaded = function() {
            inputSystem = new InputSystem();
            inputSystem.initInputSystem(inputReady);
        };

        var reqs = 0;
        var loads = 0;

        var loadCb = function() {
            loads++
            if (loads === reqs) {
                configsLoaded();
            }
        };

        var loadUiConfig = function(key, dataId) {
            reqs++;
            guiSettings.loadUiConfig(key, dataId, loadCb);
        };


        GuiAPI.initGuiApi = function() {

            guiSettings.initGuiSprite("SPRITES", "FONT_16x16");
            guiSettings.initGuiSprite("SPRITES", "ATLAS_6x6");
            guiSettings.initGuiSprite("SPRITES", "GUI_16x16");

            loadUiConfig("TEXT_LAYOUT", "FONT_16x16");
            loadUiConfig("SURFACE_LAYOUT", "BACKGROUNDS");

        };

        GuiAPI.addUiSystem = addUiSystem;

        GuiAPI.getTextSystem = function() {
            return textSystem;
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

        GuiAPI.getMouseX = function() {
            return WorldAPI.sampleInputBuffer(ENUMS.InputState.MOUSE_X);
        };

        GuiAPI.getMouseY = function() {
            return WorldAPI.sampleInputBuffer(ENUMS.InputState.MOUSE_Y);
        };

        GuiAPI.getStartDragX = function() {
            return WorldAPI.sampleInputBuffer(ENUMS.InputState.START_DRAG_X)
        };

        GuiAPI.getStartDragY = function() {
            return WorldAPI.sampleInputBuffer(ENUMS.InputState.START_DRAG_Y);
        };

        GuiAPI.viewToLayoutX = function(x) {
            return -x / WorldAPI.sampleInputBuffer(ENUMS.InputState.FRUSTUM_FACTOR) / WorldAPI.sampleInputBuffer(ENUMS.InputState.ASPECT);
        };

        GuiAPI.viewToLayoutY = function(y) {
            return  0.5 - (y / WorldAPI.sampleInputBuffer(ENUMS.InputState.FRUSTUM_FACTOR));
        };

        GuiAPI.layoutToViewX = function(x) {
            return GuiAPI.scaleByWidth(x - 0.5 );
        };

        GuiAPI.layoutToViewY = function(y) {
            return GuiAPI.scaleByHeight(1 - (0.5 + y));
        };

        GuiAPI.scaleByWidth = function(value) {
            return value * WorldAPI.sampleInputBuffer(ENUMS.InputState.FRUSTUM_FACTOR) * WorldAPI.sampleInputBuffer(ENUMS.InputState.ASPECT);
        };

        GuiAPI.scaleByHeight = function(value) {
            return value * WorldAPI.sampleInputBuffer(ENUMS.InputState.FRUSTUM_FACTOR);
        };

        GuiAPI.scaleByClampedAspect = function(value) {
            return value * WorldAPI.sampleInputBuffer(ENUMS.InputState.FRUSTUM_FACTOR) * Math.min(WorldAPI.sampleInputBuffer(ENUMS.InputState.ASPECT), 1);
        };

        GuiAPI.addInputUpdateCallback = function(cb) {
            inputUpdateCallbacks.push(cb);
        };

        GuiAPI.removeInputUpdateCallback = function(cb) {
            inputUpdateCallbacks.splice(inputUpdateCallbacks.indexOf(cb, 1));
        };

        GuiAPI.addGuiUpdateCallback = function(cb) {
            guiUpdateCallbacks.push(cb);
        };

        GuiAPI.removeGuiUpdateCallback = function(cb) {
            guiUpdateCallbacks.splice(guiUpdateCallbacks.indexOf(cb, 1));
        };

        GuiAPI.addGuiSystem = function(guiSystem) {
            guiSystem.initGuiSystem(systemReady)
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



        var dymmy1 = function(textElement) {
            textElement.drawTextString(txtSysKey,"MOO "+Math.random(), 7)
        };


        GuiAPI.updateGui = function(INPUT_BUFFER) {

            GuiDebug.updateDebugElements();
            updateBufferIndices();
            updateInput(INPUT_BUFFER);


            for (var i = 0; i < guiSystems.length; i++) {
                guiSystems[i].updateGuiSystem();
            }


            if (basicText) {
                dymmy1(basicText);
            }


            for (i = 0; i < guiUpdateCallbacks.length; i++) {
                guiUpdateCallbacks[i]();
            }

        };

        return GuiAPI;

    });