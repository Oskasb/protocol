"use strict";


define([
        'evt',
        'PipelineAPI',
        'ui/GameScreen'
    ],
    function(
        evt,
        PipelineAPI,
        GameScreen
    ) {

        var txt = {
            flscrn:"FL SCRN",
            exit:"EXIT",
            bnd:"BOUND"
        };

        var FullScreenConfigurator = function() {

            this.currentValue = 0;

        //    PipelineAPI.setCategoryData(ENUMS.Category.STATUS, {FULL_SCREEN:false});

            var _this=this;

            var apply = function(src, value) {
                setTimeout(function() {
                    _this.applyFullScreen(src, value)
                }, 100);
            };

        //    PipelineAPI.subscribeToCategoryKey(ENUMS.Category.STATUS, ENUMS.Key.FULL_SCREEN, apply);

        };

        FullScreenConfigurator.prototype.applyFullScreen = function(src, value) {

            if (this.currentValue == value) {
                return
            }

            this.currentValue = value;

        };


        return FullScreenConfigurator;

    });