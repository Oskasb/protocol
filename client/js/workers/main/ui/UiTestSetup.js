"use strict";

define([

        'client/js/workers/main/ui/widgets/GuiSimpleButton',
        'client/js/workers/main/ui/widgets/GuiProgressBar'
    ],
    function(
        GuiSimpleButton,
        GuiProgressBar
    ) {

        var tempVec1 = new THREE.Vector3();
        var tempObj1 = new THREE.Object3D();
        var tempObj2 = new THREE.Object3D();

        var progressBars = [];

        var UiTestSetup = function() {
            this.setupUiTestCallbacks();
        };

        UiTestSetup.prototype.setupUiTestCallbacks = function() {

            var toggleTestUi = function(bool) {
                console.log("Button: ", bool);
                if (bool) {
                    this.openTestUi();
                } else {
                    this.closeTestUi();
                }

            }.bind(this);

            this.callbacks = {
                toggleTestUi:toggleTestUi
            }

        };

        UiTestSetup.prototype.initUiTestSetup = function() {

            tempVec1.set(0.5, 0.35, 0);

            var widgetReady = function(widget) {
                widget.printWidgetText('TEST UI')
            };

            this.mainButton = new GuiSimpleButton();
            this.mainButton.initSimpleButton('button_big_blue', this.callbacks.toggleTestUi, widgetReady, tempVec1 )

        };


        UiTestSetup.prototype.addProgressBar = function() {

            tempVec1.set(0.1, -0.2, 0);
            tempVec1.y += progressBars.length * 0.1;

            var progressBar = new GuiProgressBar();

            var onActivate = function(bool, widget) {

                if (bool) {
                    progressBar.activateProgressBar()
                } else {
                    progressBar.deactivateProgressBar()
                }

            };

            progressBar.initProgressBar('progress_indicator_big_red', onActivate, null, tempVec1)
            progressBars.push(progressBar);
        };


        UiTestSetup.prototype.openTestUi = function() {

            console.log("Open test Ui");

            for (var i = 0; i < 5; i++) {
                this.addProgressBar();
            }

        };

        UiTestSetup.prototype.closeTestUi = function() {

        };

        UiTestSetup.prototype.setupDefaultUi = function() {

            var debugElementReady = function(widget) {
                GuiAPI.getGuiDebug().setDebugTextPanel(widget);
            };

            var debugTextPos = new THREE.Vector3(0.1, 0.1, 0);

            var debugWidget = new GuiWidget('debug_text_box');
            debugWidget.initGuiWidget(debugTextPos, debugElementReady);


            var elementReady = function(widget) {
                GuiAPI.registerTextSurfaceElement(widget.configId, widget );
                this.buildButtons(debugWidget);
            }.bind(this);

            var dtxtPos = new THREE.Vector3(-0.5, -0.3, 0);

            var mainTextWidget = new GuiWidget('main_text_box');
            mainTextWidget.initGuiWidget(dtxtPos, elementReady);




            var guiUpdatez = function(tpf, time) {

                tempVec1.copy(mainTextWidget.pos);
                tempVec1.x += Math.sin(time*2)*tpf*0.3;
                mainTextWidget.setPosition(tempVec1);
            };


            var onActiave = function(bool) {

                if (bool) {
                    console.log("Activate Button");
                    GuiAPI.addGuiUpdateCallback(guiUpdatez)
                    mainTextWidget.addChild(debugWidget);
                } else {
                    console.log("Deactivate Button");
                    GuiAPI.removeGuiUpdateCallback(guiUpdatez)
                }
            };

            mainTextWidget.addOnActiaveCallback(onActiave);


            var onActiaved = function(bool) {

                if (bool) {
                    debugWidget.detatchFromParent();
                } else {

                }
            };

            debugWidget.addOnActiaveCallback(onActiaved);

        };

        UiTestSetup.prototype.buildButtons = function(debugWidget) {

            var elementReady = function(widget) {
                widget.printWidgetText(widget.configId)
                widget.setWidgetIconKey("shield")
            };

            var button1Pos = new THREE.Vector3(-0.5, 0.3, 0);

            var button1Widget = new GuiWidget('button_big_blue');
            button1Widget.initGuiWidget(button1Pos, elementReady);


            var guiUpdate = function(tpf, time) {

                tempVec1.copy(button2Widget.pos);
                tempVec1.x += Math.sin(time*2)*tpf*0.1;
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


            var onActiaved = function(bool) {

                if (bool) {
                    button2Widget.addChild(debugWidget);
                } else {

                }
            };

            button2Widget.addOnActiaveCallback(onActiaved);


            var progressReady = function(widget) {
                widget.printWidgetText('progress');
                widget.setWidgetIconKey("plate")
            };


            var progressPos = new THREE.Vector3(0.5, 0.2, 0);
            var progressWidget = new GuiWidget('progress_indicator_big_red');
            progressWidget.initGuiWidget(progressPos, progressReady);


            var prog = 0;

            var updateProg = function(tpf, time) {
                prog += tpf;

                progressWidget.indicateProgress(0, 2, prog, 2)

            };

            var progActivate = function(bool) {
                if (bool) {
                    prog = 0;
                    GuiAPI.addGuiUpdateCallback(updateProg)
                } else {

                    GuiAPI.removeGuiUpdateCallback(updateProg)
                }
            };

            progressWidget.addOnActiaveCallback(progActivate);

        };



        return UiTestSetup;

    });