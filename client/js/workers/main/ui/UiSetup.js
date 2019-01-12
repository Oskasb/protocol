"use strict";

define([

        'client/js/workers/main/ui/systems/InputSystem',
        'client/js/workers/main/ui/systems/TextSystem',
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(

        InputSystem,
        TextSystem,
        GuiWidget
    ) {

        var UiSetup = function() {
                    };

        UiSetup.prototype.initUiSetup = function(callback) {

            GuiAPI.setInputSystem( new InputSystem());
            GuiAPI.setTextSystem( new TextSystem());

            var textSysCb = function() {
                callback();
            };

            var inputReady = function() {
                GuiAPI.getTextSystem().initTextSystem(textSysCb);
            };

            GuiAPI.getInputSystem().initInputSystem(inputReady);
        };



        UiSetup.prototype.setupDefaultUi = function() {

            var elementReady = function(widget) {
                GuiAPI.registerTextSurfaceElement(widget.configId, widget );
                this.buildButtons();
            }.bind(this);

            var dtxtPos = new THREE.Vector3(-0.5, -0.3, -1);

            var mainTextWidget = new GuiWidget('main_text_box');
            mainTextWidget.initGuiWidget(dtxtPos, elementReady);

            var debugElementReady = function(widget) {
                GuiAPI.getGuiDebug().setDebugTextPanel(widget);
            };

            var debugTextPos = new THREE.Vector3(0.3, 0.3, -1);

            var debugWidget = new GuiWidget('debug_text_box');
            debugWidget.initGuiWidget(debugTextPos, debugElementReady);


        };

        UiSetup.prototype.buildButtons = function() {

            var elementReady = function(widget) {
                widget.printWidgetText(widget.configId, 27)
            };

            var button1Pos = new THREE.Vector3(-0.5, 0.3, -1);

            var button1Widget = new GuiWidget('button_big_blue');
            button1Widget.initGuiWidget(button1Pos, elementReady);


            var button2Pos = new THREE.Vector3(-0.5, 0.2, -1);
            var button2Widget = new GuiWidget('button_big_red');
            button2Widget.initGuiWidget(button2Pos, elementReady);

        };



        return UiSetup;

    });