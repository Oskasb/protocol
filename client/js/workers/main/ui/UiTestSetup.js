"use strict";

define([

        'client/js/workers/main/ui/widgets/GuiSimpleButton',
        'client/js/workers/main/ui/widgets/GuiThumbstick',
        'client/js/workers/main/ui/widgets/GuiTextBox',
        'client/js/workers/main/ui/widgets/GuiScreenSpaceText',
        'client/js/workers/main/ui/widgets/GuiProgressBar'
    ],
    function(
        GuiSimpleButton,
        GuiThumbstick,
        GuiTextBox,
        GuiScreenSpaceText,
        GuiProgressBar
    ) {

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var testButtons = [];
        var progressBars = [];
        var textBoxes = [];
        var thumbstick;
        var matrixText;

        var UiTestSetup = function() {
            this.setupUiTestCallbacks();
        };

        UiTestSetup.prototype.setupUiTestCallbacks = function() {

            var addTextBox = function() {
                this.addTextBox();
            }.bind(this);

            var addProgressBar = function() {
                this.addProgressBar();
            }.bind(this);

            var addMatrixText = function(bool) {
                this.addMatrixText(bool);
            }.bind(this);


            var addThumbstick = function(bool) {
                this.addThumbstick(bool);
            }.bind(this);

            var toggleTestUi = function(bool) {
                console.log("Button: ", bool);
                if (bool) {
                    this.openTestUi();
                } else {
                    this.closeTestUi();
                }

            }.bind(this);

            this.callbacks = {
                toggleTestUi:toggleTestUi,
                addProgressBar:addProgressBar,
                addTextBox:addTextBox,
                addMatrixText:addMatrixText,
                addThumbstick:addThumbstick
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

        UiTestSetup.prototype.addTestButtons = function() {


            tempVec1.set(0.55, 0.29, 0);

            var b1Ready = function(widget) {
                widget.printWidgetText('Prg Bar')
            };

            var button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addProgressBar, b1Ready, tempVec1 )

            testButtons.push(button);

            var b2Ready = function(widget) {
                widget.printWidgetText('Txt Box')
            };

            tempVec1.x -= 0.15;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addTextBox, b2Ready, tempVec1 )

            testButtons.push(button);

            var b3Ready = function(widget) {
                widget.printWidgetText('MATRIX')
            };

            tempVec1.x -= 0.15;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addMatrixText, b3Ready, tempVec1 )

            testButtons.push(button);


            var b4Ready = function(widget) {
                widget.printWidgetText('STICK')
            };

            tempVec1.x -= 0.15;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addThumbstick, b4Ready, tempVec1 )

            testButtons.push(button);


        };

        UiTestSetup.prototype.addProgressBar = function() {

            tempVec1.set(0.1, -0.2, 0);
            tempVec1.y += progressBars.length * 0.06;

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


        UiTestSetup.prototype.addTextBox = function() {

            tempVec1.set(0.35, -0.38, 0);
            tempVec1.y += textBoxes.length * 0.14;

            var textBox = new GuiTextBox();

            var onActivate = function(bool, widget) {
                if (bool) {
                    textBox.activateTextBox()
                } else {
                    textBox.deactivateTextBox()
                }
            };

            textBox.initTextBox('main_text_box', onActivate, null, tempVec1)
            textBoxes.push(textBox);
        };

        UiTestSetup.prototype.addMatrixText = function(bool) {

            if (bool) {

                var onReady = function(ssTxt) {
                    tempVec1.set(-0.5, -0.5, 0);
                    tempVec2.set(1.0, 1.0, 0);

                    ssTxt.setTextDimensions(tempVec1, tempVec2);
                    ssTxt.activateScreenSpaceText()
                };

                matrixText = new GuiScreenSpaceText();

                matrixText.initScreenSpaceText(onReady);

            } else {
                if (matrixText) {
                    matrixText.removeGuiWidget();
                    matrixText = null
                }
            }

        };

        UiTestSetup.prototype.addThumbstick = function(bool) {

            if (bool) {

                var onReady = function(tmbstick) {
                    tempVec1.set(-0.3, -0.3, 0);

                    tmbstick.setOriginPosition(tempVec1)
                };

                thumbstick = new GuiThumbstick();
                thumbstick.initThumbstick('widget_thumbstick', onReady);

            } else {
                if (thumbstick) {
                    thumbstick.removeGuiWidget();
                    thumbstick = null
                }
            }

        };

        UiTestSetup.prototype.openTestUi = function() {


            this.addTestButtons();

            console.log("Open test Ui");

        };

        UiTestSetup.prototype.closeTestUi = function() {

            while (testButtons.length) {
                testButtons.pop().removeGuiWidget();
            }

            while (progressBars.length) {
                progressBars.pop().removeGuiWidget();
            }

            while (textBoxes.length) {
                textBoxes.pop().removeGuiWidget();
            }

            if (matrixText) {
                matrixText.removeGuiWidget();
                matrixText = null
            }

            if (thumbstick) {
                thumbstick.removeGuiWidget();
                thumbstick = null
            }

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