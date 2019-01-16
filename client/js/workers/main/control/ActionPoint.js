"use strict";

define([

    ],
    function(

    ) {

        var ActionPoint = function() {
            this.index = null;
        };

        ActionPoint.prototype.initActionPoint = function() {

            this.status = {
                chargeRate: 0.1,
                charges:0,
                currentTime:0,
                currentProgress:0,
                refillRate:1,
                timeToFill:3.0,
                timeToFade:0.8,
                actionReady:false,
                consumed:false
            };
        };

        ActionPoint.prototype.consumeActionPoint = function() {
            this.status.currentTime = 0;
            this.status.consumed = true;
        };

        ActionPoint.prototype.getActionPointIsConsumed = function() {
            return this.status.consumed;
        };

        ActionPoint.prototype.setActionPointIndex = function(index) {
            this.index = index;
        };

        ActionPoint.prototype.getActionPointIndex = function() {
            return this.index;
        };

        ActionPoint.prototype.getActionPointReady = function() {
            return this.status.actionReady;
        };

        ActionPoint.prototype.getActionPointProgress = function() {
            return this.status.currentProgress;
        };

        ActionPoint.prototype.updateAvailableActionPoint = function(tpf, status) {
            status.currentProgress = status.currentTime / status.timeToFill;

            if (status.currentTime > status.timeToFill) {
                //    status.currentTime -= status.timeToFill;
                status.currentProgress = 1;
                status.charges += status.chargeRate * tpf;
                status.actionReady = true;
            } else {
                status.charges = 0;
                status.actionReady = false;
            }
        };

        ActionPoint.prototype.updateConsumedActionPoint = function(tpf, status) {

            status.currentProgress = status.currentTime / status.timeToFade;

            if (status.currentTime > status.timeToFade) {
                status.currentProgress = 1;
            }
        };


        ActionPoint.prototype.updateActionPointStatus = function(tpf, status) {

            status.currentTime += tpf;

            if (this.getActionPointIsConsumed()) {
                this.updateConsumedActionPoint(tpf, status);
            } else {
                this.updateAvailableActionPoint(tpf, status);
            }

        };



        ActionPoint.prototype.updateActionPoint = function(tpf, time) {
            this.updateActionPointStatus(tpf, this.status);

        };


        return ActionPoint;

    });