"use strict";

define([

        'client/js/workers/main/ui/systems/InputSystem',
        'client/js/workers/main/ui/systems/TextSystem'
    ],
    function(

        InputSystem,
        TextSystem,
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



        UiSetup.prototype.addTextSurface = function(txtConfig, surfaceConfig, surfacePos, callback) {

            var textCB = function(txtElem) {

                var surfaceReady = function(surface) {
                    callback(txtElem)
                };

                txtElem.setupTextSurface(surfaceConfig, surfaceReady);
            };


            GuiAPI.getTextSystem().buildTextElement(textCB, txtConfig, surfacePos);

        };


        UiSetup.prototype.setupDefaultUi = function() {

            var elementReady = function(txtElem) {
                GuiAPI.registerTextSurfaceElement('main_text_box', txtElem );
            };

            var dtxtPos = new THREE.Vector3(-0.5, -0.3, -1);
            this.addTextSurface("default_text_layout", "surface_default", dtxtPos, elementReady)

            var debugTextPos = new THREE.Vector3(0.3, 0.3, -1);
            GuiAPI.getGuiDebug().addDebugTextPanel("debug_text", debugTextPos)

            this.buildButton();
        }

        UiSetup.prototype.buildButton = function() {

            var elementReady = function(txtElem) {


            //    GuiAPI.registerTextSurfaceElement('test_button', txtElem );

                txtElem.drawTextString(GuiAPI.getTextSysKey(),"BUTTON", 27)

            };

            var buttonPos = new THREE.Vector3(-0.5, 0.3, -1);
            this.addTextSurface("button_red_text_layout", "button_red_default", buttonPos, elementReady)

        }



        return UiSetup;

    });