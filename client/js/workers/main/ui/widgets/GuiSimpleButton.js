"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiSimpleButton = function() {

        };


        GuiSimpleButton.prototype.initSimpleButton = function(widgetConfig, onActivate, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(pos, onReady);
            this.guiWidget.addOnActiaveCallback(onActivate);
        };


        GuiSimpleButton.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
        };


        return GuiSimpleButton;

    });