"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiTextBox = function() {

            var updateProgress = function(tpf, time) {
                this.time += tpf;
                this.updateTextContent(this.time);
            }.bind(this);

            this.callbacks = {
                updateProgress:updateProgress
            }
        };


        GuiTextBox.prototype.initTextBox = function(widgetConfig, onActivate, onReady, pos) {
            this.guiWidget = new GuiWidget(widgetConfig);

            var widgetReady = function(widget) {
                widget.printWidgetText("TRY ME");
                widget.setPosition(pos);
            };

            this.guiWidget.initGuiWidget(null, widgetReady);
            this.guiWidget.addOnActiaveCallback(onActivate);
        };


        GuiTextBox.prototype.updateTextContent = function(text) {
            this.guiWidget.printWidgetText(text)
        };

        GuiTextBox.prototype.activateTextBox = function() {
            this.time = 0;
            GuiAPI.addGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiTextBox.prototype.deactivateTextBox = function() {
            GuiAPI.removeGuiUpdateCallback(this.callbacks.updateProgress);
        };

        GuiTextBox.prototype.removeGuiWidget = function() {
            this.deactivateTextBox();
            this.guiWidget.recoverGuiWidget();
        };

        return GuiTextBox;

    });