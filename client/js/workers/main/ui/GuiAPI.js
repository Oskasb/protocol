"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/GuiSettings',
        'client/js/workers/main/ui/GuiBuffers',
        'client/js/workers/main/ui/systems/InputSystem',
        'client/js/workers/main/ui/systems/TextSystem',
        'client/js/workers/main/ui/elements/GuiBufferElement'
    ],
    function(
        ExpandingPool,
        GuiSettings,
        GuiBuffers,
        InputSystem,
        TextSystem,
        GuiBufferElement
    ) {

        var i;
        var inputs;
        var ib;
        var pointerSys;
        var guiSurfaceSystem;
        var guiSystems = [];

        var elementPools = {};

        var inputSystem;
        var textSystem;

        var guiSettings = new GuiSettings();

        var uiSysKey = 'ui_main';
        var txtSysKey = 'ui_txt';

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

        var addUiSystem = function(sysKey, assetName, poolSize) {

            guiBuffers[sysKey] = new GuiBuffers(sysKey, assetName, poolSize);

            var addElement = function(sysKey, callback) {
                var element = new GuiBufferElement();
                callback(sysKey, element)
            };

            elementPools[sysKey] = new ExpandingPool(sysKey, addElement);

        };


        var fonts = {};

        GuiAPI.initGuiApi = function() {


            guiSettings.initGuiSettings();

            addUiSystem(uiSysKey,   "asset_nineQuad",   2500);
            addUiSystem(txtSysKey,  "asset_letterQuad", 5000);

            inputSystem = new InputSystem(uiSysKey);
            textSystem = new TextSystem("FONT_16x16");

        };

        GuiAPI.getTextSystem = function() {
            return textSystem;
        };

        GuiAPI.getFontSprites = function(spriteKey) {
            return guiSettings.getFontSprites(spriteKey);
        };

        GuiAPI.getGuiSettings = function() {
            return guiSettings;
        };

        var updateBufferIndices = function() {
            for (var key in guiBuffers) {
                guiBuffers[key].updateGuiBuffer()
            }
        };

        GuiAPI.buildBufferElement = function(guiSysId, cb) {

            var getElement = function(sysKey, elem) {
                elem.initGuiBufferElement(guiBuffers[sysKey]);
                cb(elem);
            };

            elementPools[guiSysId].getFromExpandingPool(getElement)

        };

        GuiAPI.enableGuiSystems = function() {
            GuiAPI.addGuiSystem(pointerSys);
            GuiAPI.addGuiSystem(guiSurfaceSystem)
        };

        GuiAPI.getSurfaceSystem = function() {
            return guiSurfaceSystem;
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

        var dymmy2 = function() {

        };

        var dummyCb = function(element) {

            if (Math.random() < 0.1) {
                textSystem.addTextElement( element);
                element.drawTextString(txtSysKey,"1 2 3 4 5 6 7 ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ", dymmy2)
            }
        };

        GuiAPI.updateGui = function(INPUT_BUFFER) {
            updateBufferIndices();
            updateInput(INPUT_BUFFER);
            for (var i = 0; i < guiSystems.length; i++) {
                guiSystems[i].updateGuiSystem();
            }

            for (i = 0; i < guiUpdateCallbacks.length; i++) {
                guiUpdateCallbacks[i]();
            }


            textSystem.buildTextElement(dummyCb)

        };

        return GuiAPI;

    });