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

            var buttonReady = function(widget) {
                widget.enableWidgetInteraction();
                onReady(widget)
            };

            this.guiWidget.initGuiWidget(pos, buttonReady);
            this.guiWidget.addOnActiaveCallback(onActivate);
        };


        GuiSimpleButton.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
        };

        GuiSimpleButton.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };


        return GuiSimpleButton;

    });