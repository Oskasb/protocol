"use strict";

define([

        'client/js/workers/main/ui/systems/InputSystem',
        'client/js/workers/main/ui/systems/TextSystem',
        'client/js/workers/main/ui/widgets/GuiSimpleButton',
        'client/js/workers/main/ui/elements/GuiWidget',
        'client/js/workers/main/ui/UiTestSetup'
    ],
    function(

        InputSystem,
        TextSystem,
        GuiSimpleButton,
        GuiWidget,
        UiTestSetup
    ) {

    var tempVec1 = new THREE.Vector3();
    var tempObj1 = new THREE.Object3D();
        var tempObj2 = new THREE.Object3D();

        var UiSetup = function() {
            this.uiTestSetup = new UiTestSetup();
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
            this.uiTestSetup.initUiTestSetup();
        };


        return UiSetup;

    });