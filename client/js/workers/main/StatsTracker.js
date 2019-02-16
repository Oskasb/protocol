"use strict";

define([
        'evt'
    ],
    function(evt) {

        var StatsTracker = function(parentWidget, trackStats) {


            this.trackingStats = {};

            var trackStat = function(args) {
                this.trackEventStat(args);
            }.bind(this);

            this.callbacks = {
                trackStat:trackStat
            };


            var onReady = function(widget) {

                this.statsPanel = widget;
                parentWidget.guiWidget.addChild(widget.guiWidget);
                this.setupStatsTracker(trackStats);

            }.bind(this);

            GuiAPI.buildGuiWidget('GuiStatsPanel', {configId:'widget_stats_container'}, onReady);

        };


        StatsTracker.prototype.setupStatsTracker = function(trackStats) {

            var sampleTpf = function(key, cb) {
                cb(key, MainWorldAPI.getTpf())
            };

            var sampleAdds = function(key, cb) {
                cb(key, DebugAPI.sampleStat('gui_adds'))
            };

            var sampleReleases = function(key, cb) {
                cb(key, DebugAPI.sampleStat('gui_releases'))
            };

            var sampleActives = function(key, cb) {
                cb(key, DebugAPI.sampleStat('gui_active'))
            };

            this.trackStat('TPF',   sampleTpf       ,'s'    , 3);
            this.trackStat('G_ADD', sampleReleases  ,''     , 0);
            this.trackStat('G_REL', sampleReleases  ,''     , 0);
            this.trackStat('G_ACT', sampleActives   ,''     , 0);


            for (var i = 0; i < trackStats.length; i++) {
                this.statsPanel.addTrackStatFunction(trackStats[i])
            }


            evt.on(ENUMS.Event.TRACK_STAT, this.callbacks.trackStat)

        };


        StatsTracker.prototype.trackEventStat = function(args) {
            let key = ENUMS.getKey('TrackStats', args[0]);
            DebugAPI.trackStat(key, args[1])

            if (!this.trackingStats[key]) {
                let callback = function(ki, cb) {
                    cb(ki, DebugAPI.sampleStat(ki))
                };
                let unit = '';
                if (args[2]) {
                    unit = ENUMS.getKey('Units', args[2])
                }

                this.trackingStats[key] = {key:key, callback:callback, unit:unit, digits:args[3] || 0}
                this.statsPanel.addTrackStatFunction(this.trackingStats[key])
            }

        };


        StatsTracker.prototype.trackStat = function(key, callback, unit, digits) {
            this.statsPanel.addTrackStatFunction({key:key,   callback:callback, unit:unit, digits:digits})
        };

        StatsTracker.prototype.removeStatsTracker = function() {
            evt.removeListener(ENUMS.Event.TRACK_STAT, this.callbacks.trackStat);
            this.statsPanel.removeGuiWidget();
        };

        StatsTracker.prototype.updateStatsTracker = function() {

        };

        return StatsTracker;

    });

