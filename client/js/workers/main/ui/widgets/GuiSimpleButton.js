"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiSimpleButton = function() {

        };


        GuiSimpleButton.prototype.initSimpleButton = function(widgetConfig, onActivate, onReady, pos, testActive) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var buttonReady = function(widget) {
                widget.enableWidgetInteraction();
                onReady(widget)
            };

            if (typeof(testActive) === 'function') {
                this.guiWidget.addTestActiveCallback(testActive);
            }

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