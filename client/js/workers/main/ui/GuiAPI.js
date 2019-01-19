"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'ui/widgets/WidgetBuilder',
        'ui/GuiSettings',
        'ui/GuiBuffers',
        'ui/systems/GuiDebug',
        'ui/elements/GuiBufferElement'
    ],
    function(
        ExpandingPool,
        WidgetBuilder,
        GuiSettings,
        GuiBuffers,
        GuiDebug,
        GuiBufferElement
    ) {

        var i;
        var inputs;
        var ib;
        var guiSystems = [];

        var aspect = 1;

        var elementPools = {};

        var inputSystem;
        var textSystem;


        var guiSettings = new GuiSettings();
        var widgetBuilder = new WidgetBuilder();

        var basicText;

        var txtSysKey = 'UI_TEXT_MAIN';

        var guiUpdateCallbacks = [];
        var inputUpdateCallbacks = [];
        var aspectUpdateCallbacks = [];

        var guiBuffers = {};


        var anchorWidgets = {};

        var GuiAPI = function() {

        };

        var addUiSystem = function(sysKey, spriteKey, assetName, poolSize, renderOrder) {

            guiBuffers[sysKey] = new GuiBuffers(spriteKey, assetName, poolSize, renderOrder);

            var addElement = function(poolKey, callback) {
                var element = new GuiBufferElement();
                callback(poolKey, element)
            };
            elementPools[sysKey] = new ExpandingPool(sysKey, addElement);
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
            guiSettings.initGuiSprite("SPRITES", "GUI_16x16");

            loadUiConfig("ICON_ELEMENTS", "GUI_16x16");
            loadUiConfig("SURFACE_LAYOUT", "SURFACES");

            loadUiConfig("WIDGET", "STANDARD_WIDGETS");

            loadUiConfig("FEEDBACK", "ICON");
            loadUiConfig("FEEDBACK", "SURFACE");
            loadUiConfig("FEEDBACK", "TEXT");
            loadUiConfig("SPRITE_FONT", "FONT_16x16");
            loadUiConfig("SURFACE_NINESLICE", "GUI_16x16");

        };

        GuiAPI.addUiSystem = addUiSystem;


        GuiAPI.buildBufferElement = function(uiSysKey, cb) {

            var getElement = function(key, elem) {
                elem.initGuiBufferElement(guiBuffers[key]);
                cb(elem);
            };
            elementPools[uiSysKey].getFromExpandingPool(getElement)
        };

        var registeredTextElements = {};

        GuiAPI.registerTextSurfaceElement = function(elemKey, txtElem) {
            registeredTextElements[elemKey] = txtElem;
            textSystem.addTextElement(txtElem);
        };

        GuiAPI.buildGuiWidget = function(widgetClassName, options, onReady) {
            widgetBuilder.buildWidget(widgetClassName, options, onReady);
        };

        GuiAPI.buildWidgetOptions = function(configId, onActivate, testActive, interactive, text, offset_x, offset_y, anchor) {

            var opts = {};

            opts.configId = configId || 'button_big_blue';
            opts.onActivate = onActivate || null;
            opts.testActive = testActive || null;
            opts.interactive = interactive || false;
            opts.text = text || false;
            opts.offset_x = offset_x || null;
            opts.offset_y = offset_y || null;
            opts.anchor = anchor || false;

            return opts
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


        GuiAPI.setAnchorWidget = function(key, widget) {
            anchorWidgets[key] = widget;
        };

        GuiAPI.getAnchorWidget = function(key) {
            return anchorWidgets[key];
        };

        GuiAPI.addInputUpdateCallback = function(cb) {
            inputUpdateCallbacks.push(cb);
        };

        GuiAPI.removeInputUpdateCallback = function(cb) {
            MATH.quickSplice(inputUpdateCallbacks, cb);
        };

        GuiAPI.addGuiUpdateCallback = function(cb) {
            guiUpdateCallbacks.push(cb);
        };

        GuiAPI.removeGuiUpdateCallback = function(cb) {
            MATH.quickSplice(guiUpdateCallbacks, cb);
        };

        GuiAPI.addAspectUpdateCallback = function(cb) {
            aspectUpdateCallbacks.push(cb);
        };

        GuiAPI.removeAspectUpdateCallback = function(cb) {
            MATH.quickSplice(aspectUpdateCallbacks, cb);
        };


        GuiAPI.applyAspectToScreenPosition = function(sourcePos, store) {
            store.copy(sourcePos);
            store.x = sourcePos.x * aspect;
        };

        GuiAPI.readInputBufferValue = function(inputIndex, buffer, enumKey) {
            return buffer[inputIndex*ENUMS.InputState.BUFFER_SIZE + enumKey]
        };

        GuiAPI.setCameraAspect = function(camAspect) {
            if (aspect !== camAspect) {
                aspect = camAspect;
                callAspectUpdateCallbacks(aspect);
            }
        };

        var cbs;

        var callInputUpdateCallbacks = function(input, buffer) {
            for (cbs = 0; cbs < inputUpdateCallbacks.length; cbs++) {
                inputUpdateCallbacks[cbs](input, buffer);
            }
        };

        var callAspectUpdateCallbacks = function(aspect) {
            console.log("Aspect:", aspect);
            for (cbs = 0; cbs < aspectUpdateCallbacks.length; cbs++) {
                aspectUpdateCallbacks[cbs](aspect);
            }
        };


        var updateInput = function(INPUT_BUFFER) {
            inputs = ENUMS.Numbers.POINTER_TOUCH0 + ENUMS.Numbers.TOUCHES_COUNT;
            for (ib = 0; ib < inputs; ib++) {
                if (GuiAPI.readInputBufferValue(ib, INPUT_BUFFER, ENUMS.InputState.HAS_UPDATE )) {
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

        GuiAPI.sampleInputState = function(INPUT_BUFFER) {
            updateInput(INPUT_BUFFER);
            GuiDebug.updateDebugElements();
        };

        var updateBufferIndices = function() {
            for (var key in guiBuffers) {
                guiBuffers[key].updateGuiBuffer()
            }
            GuiBuffers.monitorBufferStats();
        };

        GuiAPI.updateGui = function(tpf, time) {
            GuiDebug.updateDebugElements();
            updateBufferIndices();

            if (registeredTextElements['main_text_box']) {
                dymmy1(registeredTextElements['main_text_box']);
            }

            for (i = 0; i < guiUpdateCallbacks.length; i++) {
                guiUpdateCallbacks[i](tpf, time);
            }
        };

        return GuiAPI;

    });