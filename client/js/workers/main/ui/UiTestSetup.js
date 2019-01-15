"use strict";

define([

        'client/js/workers/main/ui/widgets/GuiSimpleButton',
        'client/js/workers/main/ui/widgets/GuiExpandingContainer',
        'client/js/workers/main/ui/widgets/GuiThumbstick',
        'client/js/workers/main/ui/widgets/GuiTextBox',
        'client/js/workers/main/ui/widgets/GuiScreenSpaceText',
        'client/js/workers/main/ui/widgets/GuiProgressBar'
    ],
    function(
        GuiSimpleButton,
        GuiExpandingContainer,
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
        var container;

        var testUiActive = false;

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

            var addMatrixText = function(inputIndex) {
                this.addMatrixText(inputIndex);
            }.bind(this);

            var addThumbstick = function(inputIndex) {
                this.addThumbstick(inputIndex);
            }.bind(this);

            var addContainer = function(inputIndex) {
                this.addContainer(inputIndex);
            }.bind(this);

            var toggleTestUi = function(inputIndex) {
                console.log("Button: ", inputIndex);
                if (testUiActive) {
                    this.closeTestUi();
                } else {
                    this.openTestUi();
                }

            }.bind(this);

            this.callbacks = {
                toggleTestUi:toggleTestUi,
                addProgressBar:addProgressBar,
                addTextBox:addTextBox,
                addMatrixText:addMatrixText,
                addThumbstick:addThumbstick,
                addContainer:addContainer
            }

        };

        UiTestSetup.prototype.initUiTestSetup = function() {

            tempVec1.set(0.3, 0.35, 0);

            var widgetReady = function(widget) {
                widget.printWidgetText('TEST UI')
            };

            var testActive = function(widget) {
                return testUiActive;
            };

            this.mainButton = new GuiSimpleButton();
            this.mainButton.initSimpleButton('button_big_blue', this.callbacks.toggleTestUi, widgetReady, tempVec1 )
            this.mainButton.setTestActiveCallback(testActive);



        };

        UiTestSetup.prototype.addTestButtons = function() {


            tempVec1.set(0.35, 0.29, 0);

            var distance = 0.09;

            var b1Ready = function(widget) {
                widget.printWidgetText('Prg Bar')
            };

            var button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addProgressBar, b1Ready, tempVec1 )

            testButtons.push(button);

            var b2Ready = function(widget) {
                widget.printWidgetText('Txt Box')
            };

            tempVec1.x -= distance;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addTextBox, b2Ready, tempVec1 )

            testButtons.push(button);


            var b3Ready = function(widget) {
                widget.printWidgetText('MATRIX')
            };

            var matrixActive = function() {
                if (matrixText) {
                    return true;
                }
            };

            tempVec1.x -= distance;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addMatrixText, b3Ready, tempVec1 )
            button.setTestActiveCallback(matrixActive);
            testButtons.push(button);


            var b4Ready = function(widget) {
                widget.printWidgetText('STICK')
            };

            var stickActive = function() {
                if (thumbstick) {
                    return true;
                }
            };

            tempVec1.x -= distance;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addThumbstick, b4Ready, tempVec1 )
            button.setTestActiveCallback(stickActive);
            testButtons.push(button);


            var b5Ready = function(widget) {
                widget.printWidgetText('CONT')
            };

            var contActive = function() {
                if (container) {
                    return true;
                }
            };

            tempVec1.x -= distance;
            button =  new GuiSimpleButton();
            button.initSimpleButton('button_big_blue', this.callbacks.addContainer, b5Ready, tempVec1 )
            button.setTestActiveCallback(contActive);
            testButtons.push(button);

        };

        UiTestSetup.prototype.addProgressBar = function() {

            tempVec1.set(0.1, -0.2, 0);
            tempVec1.y += progressBars.length * 0.06;

            var progressBar = new GuiProgressBar();

            var onActivate = function(bool, widget) {
                if (bool) {
                    progressBar.deactivateProgressBar()
                } else {
                    progressBar.activateProgressBar()
                }
            };

            progressBar.initProgressBar('progress_indicator_big_red', onActivate, null, tempVec1)
            progressBars.push(progressBar);
        };


        UiTestSetup.prototype.addTextBox = function() {

            tempVec1.set(0.25, -0.3, 0);
            tempVec1.y += textBoxes.length * 0.14;

            var textBox = new GuiTextBox();

            var onActivate = function(inputIndex, widget) {
                if (textBox.activated) {
                    textBox.deactivateTextBox()
                } else {
                    textBox.activateTextBox()
                }
            };

            textBox.initTextBox('main_text_box', onActivate, null, tempVec1)
            textBoxes.push(textBox);
        };

        UiTestSetup.prototype.addMatrixText = function(inputIndex) {

            if (!matrixText) {

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

        UiTestSetup.prototype.addThumbstick = function(inputIndex) {

            if (!thumbstick) {

                var onReady = function(tmbstick) {
                    tempVec1.set(-0.22, -0.22, 0);

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

        UiTestSetup.prototype.addContainer = function(inputIndex) {


            console.log("Add Container", inputIndex);

            var includeButton = function() {

                var bxReady = function(widget) {
                    widget.printWidgetText('child')
                    container.addChildWidgetToContainer(widget);
                };

                var button =  new GuiSimpleButton();
                button.initSimpleButton('button_big_blue', includeButton, bxReady);

            };


            if (!container) {

                var onReady = function(widget) {
                    tempVec1.set(0.02, 0.02, 0);
                    widget.setPosition(tempVec1)
                    includeButton();
                };

                container = new GuiExpandingContainer();
                container.initExpandingContainer('widget_expanding_container', onReady);

            } else {
                if (container) {
                    container.removeGuiWidget();
                    container = null
                }
            }

        };

        UiTestSetup.prototype.openTestUi = function() {
            testUiActive = true;

            this.addTestButtons();

            console.log("Open test Ui");

        };

        UiTestSetup.prototype.closeTestUi = function() {

            testUiActive = false;

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

            if (container) {
                container.removeGuiWidget();
                container = null
            }

        };






        return UiTestSetup;

    });