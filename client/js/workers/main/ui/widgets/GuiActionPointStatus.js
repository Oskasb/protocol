"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget',
        'client/js/workers/main/ui/widgets/GuiActionPoint',
        'client/js/workers/main/control/ActionPointStatus'
    ],
    function(
        GuiWidget,
        GuiActionPoint,
        ActionPointStatus
    ) {

        var apWidgetId = 'widget_action_point';
        var progWidgetId = 'widget_action_button_progress';
        var progressIcon = 'progress_horizontal';

        var tempVec1 = new THREE.Vector3();

        var GuiActionPointStatus = function() {

            this.guiActionPoints = [];
            this.releasedActionPoints = [];

            var updateActionPointStatus = function(tpf, time) {
                this.updateActionPointStatus(this.getActionPointStatus(), tpf);
            }.bind(this);

            var gapReady = function(widget) {
                this.guiWidget.addChild(widget);
            }.bind(this);


            this.callbacks = {
                updateActionPointStatus:updateActionPointStatus,
                gapReady:gapReady
            }
        };


        GuiActionPointStatus.prototype.initActionPointStatus = function(widgetConfig, onReady) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var progressReady = function(widget) {

                this.guiWidget.addChild(widget);

            }.bind(this);

            var containerReady = function(widget) {
                widget.setWidgetIconKey(progressIcon);
                onReady(widget);
            }.bind(this);

            this.guiWidget.initGuiWidget(null, containerReady);

        };

        GuiActionPointStatus.prototype.getGuiActionPointForActionPoint = function(actionPoint, apArray) {

            for (var i = 0; i < apArray.length; i++) {
                if (apArray[i].getActionPoint() === actionPoint)
                    return apArray[i];
            }
            //    console.log("No guiAP registered", this);

        };


        GuiActionPointStatus.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
            this.actionPointStatus.recoverActionPointStatus();
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateActionPointStatus);

            while (this.guiActionPoints.length) {
                this.guiActionPoints.pop().removeGuiWidget();
            }

        };

        GuiActionPointStatus.prototype.getActionPointStatus = function() {
            return this.actionPointStatus
        };


        GuiActionPointStatus.prototype.attachActionPointGui = function(actionPoint) {

            var gap = new GuiActionPoint();
            gap.initActionPoint("widget_action_point", this.callbacks.gapReady);
            gap.setActionPoint(actionPoint);
            this.guiActionPoints.push(gap);
        };

        GuiActionPointStatus.prototype.updateActionPointGui = function(guiActionPoint, actionPoint, tpf, targetPos) {
            guiActionPoint.setActionPointTargetOffset(targetPos);
            guiActionPoint.updateGuiActionPointFrame(tpf, actionPoint);

        };

        GuiActionPointStatus.prototype.updateActionPoint = function(actionPoint, tpf, maxActionPoints) {

            var count = maxActionPoints;

            var guiAP = this.getGuiActionPointForActionPoint(actionPoint, this.guiActionPoints);

            if (guiAP) {
                var posFrac = MATH.calcFraction(0, count, actionPoint.index +0.5) - 0.5;
                tempVec1.set(0.4 * posFrac, 0.03 * Math.cos(posFrac*3.145) + 0.01, 0);
                this.updateActionPointGui(guiAP, actionPoint, tpf, tempVec1);

            } else {
                this.attachActionPointGui(actionPoint);
            }

        };


        var releases = [];

        GuiActionPointStatus.prototype.updateConsumedActionPoint = function(actionPoint, tpf) {

            var guiAP = this.getGuiActionPointForActionPoint(actionPoint, this.guiActionPoints);

            if (!guiAP) {
                console.log("No AP")
                return;
            }

            releases.push(guiAP);
        };

        var removes = [];

        GuiActionPointStatus.prototype.updateReleasedActionPoint = function(guiAP, tpf) {

            guiAP.updateGuiActionPointFrame(tpf, guiAP.actionPoint);

                    if (guiAP.actionPoint.getActionPointProgress()+tpf >= 1) {
                        removes.push(guiAP)
                    }

        };


        GuiActionPointStatus.prototype.updateActionPoints = function(aps, tpf) {

            for (var i = 0; i < aps.actionPoints.length; i++) {
                this.updateActionPoint(aps.actionPoints[i], tpf, aps.getMaxActionPoints())
            }

            for (i = 0; i < aps.consumedActionPoints.length; i++) {
                this.updateConsumedActionPoint(aps.consumedActionPoints[i], tpf)
            }

            while (releases.length) {
                var release = releases.pop();

                tempVec1.copy(release.offsetPos);
                tempVec1.y += 0.05;
                release.setActionPointTargetOffset(tempVec1);

                this.releasedActionPoints.push(release);
                MATH.quickSplice(this.guiActionPoints, release);
            }

            for (i = 0; i < this.releasedActionPoints.length; i++) {
                this.updateReleasedActionPoint(this.releasedActionPoints[i], tpf)
            }

            while (removes.length) {
                var remove = removes.pop();
                MATH.quickSplice(this.releasedActionPoints, remove);

                remove.removeGuiWidget();
            }

        };

        GuiActionPointStatus.prototype.updateActionPointStatus = function(aps, tpf) {
            this.updateActionPoints(aps, tpf);
            this.guiWidget.indicateProgress(0, aps.getTimePerPoint(), aps.getCurrentProgress(), 1);


            if (Math.random() < 0.03) {
                aps.consumeActionPoints( Math.floor(Math.random() * (aps.countReadyActionPoints() ) ) );
            }

        };

        GuiActionPointStatus.prototype.setActionPointStatus = function(aps) {
            this.actionPointStatus = aps;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateActionPointStatus);
        };

        GuiActionPointStatus.prototype.createDummyActionPointStatus = function(count) {
            var aps = new ActionPointStatus();
            aps.activateActionPointStatus(count);
            return aps
        };

        return GuiActionPointStatus;

    });