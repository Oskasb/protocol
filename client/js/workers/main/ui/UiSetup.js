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

    var tempVec1 = new THREE.Vector3();
    var tempObj1 = new THREE.Object3D();
        var tempObj2 = new THREE.Object3D();

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

            var dtxtPos = new THREE.Vector3(-0.5, -0.3, 0);

            var mainTextWidget = new GuiWidget('main_text_box');
            mainTextWidget.initGuiWidget(dtxtPos, elementReady);

            var debugElementReady = function(widget) {
                GuiAPI.getGuiDebug().setDebugTextPanel(widget);
            };

            var debugTextPos = new THREE.Vector3(0.3, 0.3, 0);

            var debugWidget = new GuiWidget('debug_text_box');
            debugWidget.initGuiWidget(debugTextPos, debugElementReady);



            var guiUpdatez = function(tpf, time) {

                tempVec1.copy(mainTextWidget.pos);
                tempVec1.x += Math.sin(time*2)*tpf*0.3;
                mainTextWidget.setPosition(tempVec1);
            };


            var onActiave = function(bool) {

                if (bool) {
                    console.log("Activate Button");
                    GuiAPI.addGuiUpdateCallback(guiUpdatez)

                } else {
                    console.log("Deactivate Button");
                    GuiAPI.removeGuiUpdateCallback(guiUpdatez)
                }
            };

            mainTextWidget.addOnActiaveCallback(onActiave);


        };

        UiSetup.prototype.buildButtons = function() {

            var elementReady = function(widget) {
                widget.printWidgetText(widget.configId, 27)
            };

            var button1Pos = new THREE.Vector3(-0.5, 0.3, 0);

            var button1Widget = new GuiWidget('button_big_blue');
            button1Widget.initGuiWidget(button1Pos, elementReady);


            var guiUpdate = function(tpf, time) {

                tempVec1.copy(button2Widget.pos);
                tempVec1.x += Math.sin(time*2)*tpf*0.3;
                button2Widget.setPosition(tempVec1);
            };


            var onActiave = function(bool) {

                if (bool) {
                    console.log("Activate Button");
                    GuiAPI.addGuiUpdateCallback(guiUpdate)

                } else {
                    console.log("Deactivate Button");
                    GuiAPI.removeGuiUpdateCallback(guiUpdate)
                }
            };

            button1Widget.addOnActiaveCallback(onActiave);

            var button2Pos = new THREE.Vector3(-0.5, 0.2, 0);
            var button2Widget = new GuiWidget('button_big_red');
            button2Widget.initGuiWidget(button2Pos, elementReady);

        };



        return UiSetup;

    });