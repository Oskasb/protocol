"use strict";

define([
        'client/js/workers/main/ui/widgets/GuiStatsPanel',
        'client/js/workers/main/ui/widgets/GuiActionPointStatus',
        'client/js/workers/main/ui/widgets/GuiActionButton',
        'client/js/workers/main/ui/widgets/GuiSimpleButton',
        'client/js/workers/main/ui/widgets/GuiExpandingContainer',
        'client/js/workers/main/ui/widgets/GuiThumbstick',
        'client/js/workers/main/ui/widgets/GuiTextBox',
        'client/js/workers/main/ui/widgets/GuiScreenSpaceText',
        'client/js/workers/main/ui/widgets/GuiProgressBar'
    ],
    function(
        GuiStatsPanel,
        GuiActionPointStatus,
        GuiActionButton,
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
        var actionButtons = [];
        var thumbstick;
        var matrixText;
        var container;

        var actionPointStatus;

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

            var addActionButton = function(inputIndex) {
                this.addActionButton(inputIndex)
            }.bind(this);

            var addActionPointStatus = function(inputIndex) {
                this.addActionPointStatus(inputIndex)
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
                addContainer:addContainer,
                addActionButton:addActionButton,
                addActionPointStatus:addActionPointStatus
            }

        };

        var statsPanel;
        var addStatsPanel = function() {
            if (statsPanel) {
                statsPanel.removeGuiWidget();
                statsPanel = null;
            } else {
                statsPanel = new GuiStatsPanel();

                var sampleTpf = function(key, cb) {
                    cb(key, MainWorldAPI.getTpf())
                };

                var sampleAdds = function(key, cb) {
                    cb(key, MainWorldAPI.sampleStat('gui_adds'))
                };

                var sampleReleases = function(key, cb) {
                    cb(key, MainWorldAPI.sampleStat('gui_releases'))
                };

                var sampleActives = function(key, cb) {
                    cb(key, MainWorldAPI.sampleStat('gui_active'))
                };

                var statsOnReady = function(widget) {

                    widget.setPosition(tempVec1);
                    statsPanel.addTrackStatFunction({key:'TPF', callback:sampleTpf, unit:'s', digits:3});
                    statsPanel.addTrackStatFunction({key:'G_ADD', callback:sampleReleases, unit:'', digits:0});
                    statsPanel.addTrackStatFunction({key:'G_REL', callback:sampleReleases, unit:'', digits:0});
                    statsPanel.addTrackStatFunction({key:'G_ACT', callback:sampleActives, unit:'', digits:0});
                };

                tempVec1.set(0.47, 0.30, 0);
                statsPanel.initStatsPanel('widget_stats_container',statsOnReady, tempVec1)
            }

        };

        UiTestSetup.prototype.initUiTestSetup = function() {

            tempVec1.set(0.2, 0.35, 0);

            var widgetReady = function(widget) {
                widget.printWidgetText('TESTS')
            };

            var testActive = function(widget) {
                return testUiActive;
            };

            this.mainButton = new GuiSimpleButton();
            this.mainButton.initSimpleButton('button_big_blue', this.callbacks.toggleTestUi, widgetReady, tempVec1, testActive )


            var statsReady = function(widget) {
                widget.printWidgetText('STATS')
            };

            var statsActive = function(widget) {
                return statsPanel;
            };

            tempVec1.x += 0.11;

            this.statsButton = new GuiSimpleButton();
            this.statsButton.initSimpleButton('button_big_blue', addStatsPanel, statsReady, tempVec1, statsActive )

        };

        var addTopButton = function(label, onActivate, testActive) {

            var lbl = label;

            var onReady = function(widget) {
                widget.printWidgetText(lbl)
                container.addChildWidgetToContainer(widget);
            };

            var button =  new GuiSimpleButton();

            button.initSimpleButton('button_big_blue', onActivate, onReady, null, testActive);
       //     if (testActive) {
       //         button.setTestActiveCallback(testActive);
       //     }

            testButtons.push(button);

            var distance = 0.09;
            tempVec1.x -= distance;
        };


        UiTestSetup.prototype.addTestButtons = function() {

            this.addContainer();



            tempVec1.set(0.35, 0.29, 0);


            var spamActive = function() {
                return MainWorldAPI.getWorldSimulation().readWorldStatusValue('randomSpawn');
            };

            var spawnSpam = function() {
                var wstatus = MainWorldAPI.getWorldSimulation().getWorldStatus();
                wstatus.randomSpawn = !wstatus.randomSpawn
            };

            addTopButton('SPAWN', spawnSpam, spamActive);


            addTopButton('Prg Bar', this.callbacks.addProgressBar, null);
            addTopButton('txtbox', this.callbacks.addTextBox, null);



            var matrixActive = function() {
                if (matrixText) {
                    return true;
                }
            };

            addTopButton('MATRIX', this.callbacks.addMatrixText, matrixActive);


            var stickActive = function() {
                if (thumbstick) {
                    return true;
                }
            };

            addTopButton('STICK', this.callbacks.addThumbstick, stickActive);





            var abPresent = function() {
                if (actionButtons.length) {
                    return true;
                }
            };

            addTopButton('ACTION', this.callbacks.addActionButton, abPresent);


            var apsPresent = function() {
                if (actionPointStatus) {
                    return true;
                }
            };

            addTopButton('APS', this.callbacks.addActionPointStatus, apsPresent);

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

            if (!container) {

                var onReady = function(widget) {
                    tempVec1.set(0.3, 0.33, 0);
                    widget.setPosition(tempVec1)
                //    includeButton();
                };

                container = new GuiExpandingContainer();
                container.initExpandingContainer('widget_expanding_container', onReady);
            }
        };



        UiTestSetup.prototype.addActionButton = function(inputIndex) {


            console.log("Add Action Button", inputIndex);

            var attachAction = function(ab) {

                console.log("Attach Action Button action...", ab);
                ab.attachActionToButton(ab.getDummyAction());
            };


            var count = -0.9;

            var addAB = function() {

                var onReady = function(widget) {


                    tempVec1.x +=  Math.sin(count*0.45)*0.08;
                    tempVec1.y +=  Math.cos(count*0.45)*0.12;
                    count++;

                    widget.setPosition(tempVec1)
                    attachAction(actionButton);
                };

                var actionButton = new GuiActionButton();
                actionButton.initActionButton('widget_action_button', onReady);
                actionButtons.push(actionButton);
            };

            if (!actionButtons.length) {

                tempVec1.set(0.2, -0.42, 0);

                addAB();
                addAB();
                addAB();
                addAB();
                addAB();

            } else {
                while (actionButtons.length) {
                    actionButtons.pop().removeGuiWidget();
                }
            }
        };

        var actionPointStatus;

        UiTestSetup.prototype.addActionPointStatus = function(inputIndex) {

            console.log("Add GuiActionPointStatus", inputIndex);

            var addApB = function() {

                var onReady = function(widget) {

                    tempVec1.set(0.0, -0.41, 0);
                    widget.setPosition(tempVec1)
                    actionPointStatus.setActionPointStatus(actionPointStatus.createDummyActionPointStatus(10));
                };

                actionPointStatus = new GuiActionPointStatus();
                actionPointStatus.initActionPointStatus('widget_action_point_container', onReady);
            };

            if (!actionPointStatus) {
                addApB();
            } else {
                actionPointStatus.removeGuiWidget();
                actionPointStatus = null;
            }
        };


        UiTestSetup.prototype.openTestUi = function() {
            testUiActive = true;

            this.addTestButtons();

            console.log("Open test Ui");
        };

        UiTestSetup.prototype.closeTestUi = function() {

            if (!testUiActive) {
                console.log("Not active");
                return;
            }

            testUiActive = false;

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

            if (container) {
                container.removeGuiWidget();
                container = null
            }

        };



        return UiTestSetup;

    });