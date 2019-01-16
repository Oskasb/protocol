"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {

    var progWidgetId = 'widget_action_button_progress';
    var progressIcon = 'plate';



        var updateActionProgress = function(tpf, time) {
            action.currentTime += tpf;

            if (action.currentTime > action[timersMap[action.state]]) {
                action.currentTime -= action[timersMap[action.state]];
                action.state = stateChainMap[action.state];
                action.targetTime = action[timersMap[action.state]];
            }

            if (action.state === ENUMS.ActionState.ACTIVATING) {
                action.text = "atk";
                action.progressTime = action.currentTime
            }

            if (action.state === ENUMS.ActionState.ACTIVE) {
                action.text = "active";
                action.progressTime = action.currentTime
            }

            if (action.state === ENUMS.ActionState.ON_COOLDOWN) {
                action.text = "cooling";
                action.progressTime = action.targetTime - action.currentTime
            }

            if (action.state === ENUMS.ActionState.AVAILABLE) {
                GuiAPI.removeGuiUpdateCallback(action.updateActionProgress);
                action.text = "ready";
                action.active = false;
                action.progressTime = 0;
            }

        };


        var activateAction = function() {
            if (!action.active) {
                GuiAPI.addGuiUpdateCallback(action.updateActionProgress);
                action.active = true;
                action.state = stateChainMap[action.state];
                action.targetTime = action[timersMap[action.state]];
                action.text = "__";
            }
        };

        var action = {
            activationTime:1.3,
            activeTime: 0.5,
            cooldownTime:2.5,
            targetTime:0,
            progressTime:0,
            currentTime:0,
            active:false,
            state:ENUMS.ActionState.AVAILABLE,
            name:"Test it",
            text:"init",
            icon:"fire",
            updateActionProgress:updateActionProgress,
            activateAction:activateAction
        };



        var stateChainMap = {};
        stateChainMap[ENUMS.ActionState.AVAILABLE]      = ENUMS.ActionState.ACTIVATING;
        stateChainMap[ENUMS.ActionState.ACTIVATING]     = ENUMS.ActionState.ACTIVE;
        stateChainMap[ENUMS.ActionState.ACTIVE]         = ENUMS.ActionState.ON_COOLDOWN;
        stateChainMap[ENUMS.ActionState.ON_COOLDOWN]    = ENUMS.ActionState.AVAILABLE;


        var isActiveMap = {};
        isActiveMap[ENUMS.ActionState.AVAILABLE] = false;
        isActiveMap[ENUMS.ActionState.ACTIVATING] = true;
        isActiveMap[ENUMS.ActionState.ACTIVE] = true;
        isActiveMap[ENUMS.ActionState.ON_COOLDOWN] = false;
        isActiveMap[ENUMS.ActionState.ENABLED] = true;
        isActiveMap[ENUMS.ActionState.DISABLED] = false;

        var timersMap = {};
        timersMap[ENUMS.ActionState.ACTIVATING] = 'activationTime';
        timersMap[ENUMS.ActionState.ACTIVE] = 'activeTime';
        timersMap[ENUMS.ActionState.ON_COOLDOWN] = 'cooldownTime';
        timersMap[ENUMS.ActionState.AVAILABLE]   = 'activationTime';

        var GuiActionButton = function() {

            var testActive = function() {
                return isActiveMap[action.state];
            };

            var activateAction = function(inputIndex, widget) {
                this.actionButtonActivated(inputIndex, widget);
            }.bind(this);

            var updateProgress = function(tpf, time) {
                this.updateCurrentProgress(action);
            }.bind(this);

            this.callbacks = {
                testActive:testActive,
                activateAction:activateAction,
                updateProgress:updateProgress
            }
        };


        GuiActionButton.prototype.initActionButton = function(widgetConfig, onReady) {
            this.guiWidget = new GuiWidget(widgetConfig);




            var progressReady = function(widget) {

                this.guiWidget.addChild(widget);

            }.bind(this)

            var buttonReady = function(widget) {
                widget.enableWidgetInteraction();
                onReady(widget)

                this.progressWidget = new GuiWidget(progWidgetId);
                this.progressWidget.initGuiWidget(null, progressReady);
                this.progressWidget.setWidgetIconKey(progressIcon);
                this.setTestActiveCallback(this.callbacks.testActive);
            }.bind(this);

            this.guiWidget.initGuiWidget(null, buttonReady);
        //    this.guiWidget.addOnActiaveCallback(onActivate);

        };



        GuiActionButton.prototype.attachActionToButton = function(action) {

            this.guiWidget.printWidgetText(action.name);
            this.guiWidget.setWidgetIconKey(action.icon);
            this.guiWidget.addOnActiaveCallback(this.callbacks.activateAction);

        };



        GuiActionButton.prototype.updateCurrentProgress = function(action) {

            if (!action.text) {
                console.log("TextMissing", action)
            } else {
                this.guiWidget.setFirstSTringText(action.text);
            }



            this.progressWidget.indicateProgress(0, action.targetTime, action.progressTime, 1)

            if (!action.active) {
                this.progressWidget.setFirstSTringText(' ');
            }

        };

        GuiActionButton.prototype.actionButtonInitiateAction = function() {
            action.currentTime = 0;
            action.activateAction();
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        };


        GuiActionButton.prototype.actionButtonActivated = function(inputIndex, widget) {

            if (action.state !== ENUMS.ActionState.AVAILABLE) return;

            this.actionButtonInitiateAction()
        };

        GuiActionButton.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };


        GuiActionButton.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
            this.progressWidget.recoverGuiWidget();
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiActionButton.prototype.getDummyAction = function() {
            return action;
        };

        return GuiActionButton;

    });