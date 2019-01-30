"use strict";

define([

    ],
    function(

    ) {

        var stateChainMap = {};
        stateChainMap[ENUMS.ActionState.AVAILABLE]      = ENUMS.ActionState.ACTIVATING;
        stateChainMap[ENUMS.ActionState.ACTIVATING]     = ENUMS.ActionState.ACTIVE;
        stateChainMap[ENUMS.ActionState.ACTIVE]         = ENUMS.ActionState.ON_COOLDOWN;
        stateChainMap[ENUMS.ActionState.ON_COOLDOWN]    = ENUMS.ActionState.AVAILABLE;

        var isActiveMap = {};
        isActiveMap[ENUMS.ActionState.AVAILABLE] = false;
        isActiveMap[ENUMS.ActionState.ACTIVATING] = true;
        isActiveMap[ENUMS.ActionState.ACTIVE] = true;
        isActiveMap[ENUMS.ActionState.ON_COOLDOWN] = true;
        isActiveMap[ENUMS.ActionState.ENABLED] = true;
        isActiveMap[ENUMS.ActionState.DISABLED] = false;
        isActiveMap[ENUMS.ActionState.UNAVAILABLE] = false;

        var timersMap = {};
        timersMap[ENUMS.ActionState.ACTIVATING] = 'activationTime';
        timersMap[ENUMS.ActionState.ACTIVE] = 'activeTime';
        timersMap[ENUMS.ActionState.ON_COOLDOWN] = 'cooldownTime';
        timersMap[ENUMS.ActionState.AVAILABLE]   = 'activationTime';


        var Action = function() {

            this.params = {
                activationTime:1.3,
                activeTime: 0.5,
                cooldownTime:2.5,
                recoverTime:0.5,
                targetTime:0,
                progressTime:0,
                currentTime:0,
                active:false,
                action_points:1,
                state:ENUMS.ActionState.AVAILABLE,
                action_type:ENUMS.ActionState.ATTACK_GREATSWORD,
                name:"Test it",
                text:" ",
                icon:"fire"
            };

            var updateActionProgress = function(tpf, time) {
                this.updateActionProgress(tpf, time)
            }.bind(this);

            this.insufficientActionPoints = true;

            this.onStateChangeCallbacks = [];
            this.onActivateCallbacks = [];

            this.callbacks = {
                updateActionProgress:updateActionProgress
            }
        };

        Action.prototype.initAction = function(dataId, workerData, onReady) {
            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                this.applyActionConfig(this.workerData.data);
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);

            this.workerData.fetchData(dataId, onDataReady);

        };

        Action.prototype.applyActionConfig = function(actionConfig) {
            for (var key in actionConfig) {
                this.params[key] = actionConfig[key];
            }
        };

        Action.prototype.updateActionFrameParams = function(params, tpf) {
            params.currentTime += tpf;
            if (params.currentTime > params[timersMap[params.state]]) {
                params.currentTime -= params[timersMap[params.state]];
                params.state = stateChainMap[params.state];
                params.targetTime = params[timersMap[params.state]];
                this.notifyActionStateChange()
            }
        };

        Action.prototype.applyActionFrameParams = function(params) {
            if (params.state === ENUMS.ActionState.ACTIVATING) {
                params.text = "atk";
                params.progressTime = params.currentTime
            }

            if (params.state === ENUMS.ActionState.ACTIVE) {
                params.text = "active";
                params.progressTime = params.currentTime
            }

            if (params.state === ENUMS.ActionState.ON_COOLDOWN) {
                params.text = "cooling";
                params.progressTime = params.targetTime - params.currentTime
            }

            if (params.state === ENUMS.ActionState.AVAILABLE) {
                MainWorldAPI.removeWorldUpdateCallback(this.callbacks.updateActionProgress);
                params.text = params.name;
                params.active = false;
                params.progressTime = 0;
                this.actionEnded()
            }
        };

        Action.prototype.updateActionProgress = function(tpf, time) {

            this.updateActionFrameParams(this.params, tpf);
            this.applyActionFrameParams(this.params);

        };

        Action.prototype.activateAction = function() {

            if (!this.params.active) {
                MainWorldAPI.addWorldUpdateCallback(this.callbacks.updateActionProgress);
                this.params.active = true;

                this.params.state = stateChainMap[this.params.state];

                this.params.targetTime = this.params[timersMap[this.params.state]];
                this.params.text = " ";
                this.notifyActionStateChange();
            }
        };

        Action.prototype.activateActionNow = function() {
            this.params.currentTime = 0;
            this.activateAction();
        };

        Action.prototype.requestActivation = function() {
            this.notifyActionActivate();
        };

        Action.prototype.testAvailable = function() {

            return this.getActionState() === ENUMS.ActionState.AVAILABLE;
        };

        Action.prototype.testActivatable = function() {
            return isActiveMap[this.params.state];
        };

        Action.prototype.getActionName = function() {
            return this.params.name;
        };

        Action.prototype.getActionText = function() {
            return this.params.text;
        };

        Action.prototype.getActionIcon = function() {
            return this.params.icon;
        };

        Action.prototype.getActionTargetTime = function() {
            return this.params.targetTime;
        };

        Action.prototype.getActionRecoverTime = function() {
            return this.params.recoverTime;
        };

        Action.prototype.getActionProgressTime = function() {
            return this.params.progressTime;
        };

        Action.prototype.getActionState = function() {
            return this.params.state;
        };

        Action.prototype.getActionIsActive = function() {
            return this.params.active;
        };

        Action.prototype.getActionType = function() {
            return this.params.action_type;
        };

        Action.prototype.getActionPointCost = function() {
            return this.params.action_points;
        };

        Action.prototype.addActionStateChangeCallback = function(cb) {
            this.onStateChangeCallbacks.push(cb);
        };

        Action.prototype.notifyActionStateChange = function() {

            MATH.callAll(this.onStateChangeCallbacks, this)
        };

        Action.prototype.addActionActivateCallback = function(cb) {
            this.onActivateCallbacks.push(cb);
        };

        Action.prototype.notifyActionActivate = function() {
            MATH.callAll(this.onActivateCallbacks, this)
        };

        Action.prototype.actionEnded = function() {
            //    MATH.emptyArray(this.onStateChangeCallbacks)
        };

        Action.prototype.hasSufficientActionPoints = function() {
            return !this.insufficientActionPoints;
        };

        Action.prototype.updateAvailableAcionPointCount = function(count) {
            console.log("PointCOunt", count)
            this.insufficientActionPoints = count < this.getActionPointCost();

            if (this.insufficientActionPoints) {
                if (this.getActionState() === ENUMS.ActionState.AVAILABLE) {
                    this.params.state = ENUMS.ActionState.UNAVAILABLE;
                }
            } else {
                if (this.getActionState() === ENUMS.ActionState.UNAVAILABLE) {
                    this.params.state = ENUMS.ActionState.AVAILABLE;
                }
            }
        };

        return Action;

    });