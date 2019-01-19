"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget',
        'client/js/workers/main/control/Action'
    ],
    function(
        GuiWidget,
        Action
    ) {

    var progWidgetId = 'widget_action_button_progress';
    var progressIcon = 'progress_vertical';


        var stateFeedbackMap = {};
        stateFeedbackMap[ENUMS.ActionState.UNAVAILABLE   ] = ENUMS.ElementState.DISABLED    ;
        stateFeedbackMap[ENUMS.ActionState.AVAILABLE     ] = ENUMS.ElementState.NONE        ;
        stateFeedbackMap[ENUMS.ActionState.ACTIVATING    ] = ENUMS.ElementState.ACTIVE      ;
        stateFeedbackMap[ENUMS.ActionState.ACTIVE        ] = ENUMS.ElementState.ACTIVE_PRESS;
        stateFeedbackMap[ENUMS.ActionState.ON_COOLDOWN   ] = ENUMS.ElementState.DISABLED    ;
        stateFeedbackMap[ENUMS.ActionState.ENABLED       ] = ENUMS.ElementState.NONE        ;


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
                action.text = " ";
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



        var GuiActionButton = function() {

            var testActive = function() {
                if (this.action) {
                    return this.action.testActivatable()
                }
            }.bind(this);

            var activateAction = function(inputIndex, widget) {
                this.actionButtonActivated(inputIndex, widget);
            }.bind(this);

            var updateProgress = function(tpf, time) {
                this.updateCurrentProgress(this.getAction());
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

            }.bind(this);

            var buttonReady = function(widget) {
                widget.enableWidgetInteraction();

                this.progressWidget = new GuiWidget(progWidgetId);
                this.progressWidget.initGuiWidget(null, progressReady);
                this.progressWidget.setWidgetIconKey(progressIcon);
                this.setTestActiveCallback(this.callbacks.testActive);

                widget.attachToAnchor('bottom_right');

                onReady(widget)

            }.bind(this);

            this.guiWidget.initGuiWidget(null, buttonReady);
        //    this.guiWidget.addOnActiaveCallback(onActivate);

        };


        GuiActionButton.prototype.setAction = function(action) {
            this.action = action;
        };


        GuiActionButton.prototype.getAction = function() {
            return this.action;
        };


        GuiActionButton.prototype.attachActionToButton = function(action) {
            this.setAction(action);
            this.guiWidget.printWidgetText(action.getActionName());
            this.guiWidget.setWidgetIconKey(action.getActionIcon());
            this.guiWidget.addOnActiaveCallback(this.callbacks.activateAction);
        };


        GuiActionButton.prototype.updateCurrentProgress = function(action) {


            if (!action.getActionText()) {
                console.log("TextMissing", action)
            } else {
                this.guiWidget.setFirstSTringText(action.getActionText());
            }


            this.progressWidget.indicateProgress(0, action.getActionTargetTime(), action.getActionProgressTime(), 1);

            this.guiWidget.setWidgetInteractiveState(stateFeedbackMap[action.getActionState()]);
            this.progressWidget.setWidgetInteractiveState(stateFeedbackMap[action.getActionState()]);

            if (!action.getActionIsActive()) {
                this.progressWidget.setFirstSTringText(null);
                this.guiWidget.enableWidgetInteraction();
                GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
            }

        };

        GuiActionButton.prototype.actionButtonInitiateAction = function() {
            this.getAction().activateActionNow();
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
            this.guiWidget.disableWidgetInteraction();
        };


        GuiActionButton.prototype.actionButtonActivated = function(inputIndex, widget) {

            if (this.getAction().testAvailable()) {
                this.actionButtonInitiateAction()
            }

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
            return new Action();
        };

        return GuiActionButton;

    });