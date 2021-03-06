"use strict";

define([
        './ActionPoint',
        'application/ExpandingPool'
    ],
    function(
        ActionPoint,
        ExpandingPool
    ) {

        var fetchPoint = function(assetId, callback) {
            callback(new ActionPoint());
        }.bind(this);

        var expandingPool = new ExpandingPool('action_point', fetchPoint);

        var ActionPointStatus = function() {

            this.status = {
                maxActionPoints:0,
                currentTime:0,
                currentProgress:0,
                refillRate:1,
                timePerPoint:0.25,
                state:ENUMS.ActionState.DISABLED
            };

            this.readyActionPoints = 0;

            this.actionPoints = [];
            this.consumedActionPoints = [];

            this.actionPointsUpdatedCallbacks = [];

            this.onRemoveCallbacks = [];

            var updateActionPointStatus = function(tpf, time) {
                this.updateActionPointStatus(tpf, time)
            }.bind(this);

            this.callbacks = {
                updateActionPointStatus:updateActionPointStatus
            }
        };

        ActionPointStatus.prototype.initActionPointStatus = function(dataId, workerData, onReady) {
            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                this.applyConfig(this.workerData.data);
                if (!isUpdate) {
                    MainWorldAPI.addWorldUpdateCallback(this.callbacks.updateActionPointStatus);
                    onReady(this);
                }
            }.bind(this);

            this.workerData.fetchData(dataId, onDataReady);

        };

        ActionPointStatus.prototype.applyConfig = function(config) {

            for (var key in config) {
                this.status[key] = config[key];
            }
        };

        ActionPointStatus.prototype.activateActionPointStatus = function(count) {

            this.setActionPointMax(count);
            MainWorldAPI.addWorldUpdateCallback(this.callbacks.updateActionPointStatus);

        };

        var updateActionPointIndices = function(actionPoints) {
            for (var i = 0; i < actionPoints.length; i++) {
                actionPoints[i].setActionPointIndex(i)
            }
        };

        ActionPointStatus.prototype.addActionPoint = function(actionPoints) {
            var cb = function(ap) {
                actionPoints.push(ap);
                ap.initActionPoint();
                updateActionPointIndices(actionPoints);
            };
            expandingPool.getFromExpandingPool(cb);
        };

        ActionPointStatus.prototype.recoverActionPointStatus = function() {
            MainWorldAPI.removeWorldUpdateCallback(this.callbacks.updateActionPointStatus);
            while(this.actionPoints.length){
                var ap = this.actionPoints.pop();
                expandingPool.returnToExpandingPool(ap);
            }
        };

        ActionPointStatus.prototype.updateActionStatusFrame = function(tpf) {

            this.status.currentTime += tpf;

            if (this.status.currentTime > this.status.timePerPoint) {

                if (this.actionPoints.length >= this.status.maxActionPoints) {
                    this.status.currentProgress = this.status.timePerPoint;
                    this.status.currentTime = this.status.timePerPoint;
                    this.setApsState(ENUMS.ActionState.ENABLED);
                    return;
                }

                this.status.currentTime -= this.status.timePerPoint;

                if (this.actionPoints.length <= this.status.maxActionPoints) {
                    this.addActionPoint(this.actionPoints);
                } else {
                    this.setApsState(ENUMS.ActionState.ACTIVE);
                }
            } else {
                this.setApsState(ENUMS.ActionState.ACTIVATING);
            }

            this.status.currentProgress = this.status.currentTime;

        };

        ActionPointStatus.prototype.updateActionPoints = function(tpf) {

            for (var i = 0; i < this.actionPoints.length; i++) {
                this.actionPoints[i].updateActionPoint(tpf);
            }
        };

        var removes = [];

        ActionPointStatus.prototype.updateConsumedActionPoints = function(tpf) {
            for (var i = 0; i < this.consumedActionPoints.length; i++) {
                this.consumedActionPoints[i].updateActionPoint(tpf);

                if (this.consumedActionPoints[i].getActionPointProgress() === 1) {
                    removes.push(this.consumedActionPoints[i]);
                }
            }

            while (removes.length) {
                MATH.quickSplice(this.consumedActionPoints, removes.pop())
            }
        };

        ActionPointStatus.prototype.updateActionPointStatus = function(tpf, time) {
            this.updateActionStatusFrame(tpf);
            this.updateActionPoints(tpf);
            this.updateConsumedActionPoints(tpf);
            this.countReadyActionPoints();
        };

        ActionPointStatus.prototype.getTimePerPoint = function() {
            return this.status.timePerPoint
        };

        ActionPointStatus.prototype.getCurrentProgress = function() {
            return this.status.currentProgress
        };

        ActionPointStatus.prototype.setActionPointMax = function(count) {
            this.status.maxActionPoints = count;
        };

        ActionPointStatus.prototype.getMaxActionPoints = function() {
            return this.status.maxActionPoints;
        };

        ActionPointStatus.prototype.setApsState = function(state) {
            this.status.state = state;
        };

        ActionPointStatus.prototype.getApsState = function() {
            return this.status.state;
        };

        ActionPointStatus.prototype.addActionPointsUpdatedCallback = function(cb) {
            this.actionPointsUpdatedCallbacks.push(cb);
        };

        ActionPointStatus.prototype.notifyAvailableActionPoints = function() {
            MATH.callAll(this.actionPointsUpdatedCallbacks, this.readyActionPoints);
        };

        ActionPointStatus.prototype.countReadyActionPoints = function() {

            var ready = 0;

            for (var i = 0; i < this.actionPoints.length; i++) {
                if (this.actionPoints[i].getActionPointReady()) {
                    ready++
                }
            }

            if (ready !== this.readyActionPoints) {
                this.readyActionPoints = ready;
                this.notifyAvailableActionPoints(ready);
            }

            return ready;
        };

        ActionPointStatus.prototype.consumeActionPoints = function(count) {

            for (var i = 0; i < count; i++) {
                var ap = this.actionPoints.shift();
                ap.consumeActionPoint();
                this.consumedActionPoints.push(ap);
            }

            updateActionPointIndices(this.actionPoints);

        };

        ActionPointStatus.prototype.addRemoveActionPointStatusCallback = function(cb) {
            this.onRemoveCallbacks.push(cb);
        };

        ActionPointStatus.prototype.removeActionPointStatus = function() {

            while(this.onRemoveCallbacks.length) {
                this.onRemoveCallbacks.pop()(this);
            }

        };

        return ActionPointStatus;

    });