"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {

    var progWidgetId = 'widget_action_button_progress';
    var progressIcon = 'debug_nine';

        var GuiActionButton = function() {

        };


        GuiActionButton.prototype.initActionButton = function(widgetConfig, onReady) {
            this.guiWidget = new GuiWidget(widgetConfig);


            var progressReady = function(widget) {

                this.guiWidget.addChild(widget);

            }.bind(this)

            var buttonReady = function(widget) {
                widget.enableWidgetInteraction();
                onReady(widget)

                this.progressWidget = new GuiWidget(progWidgetId);
                this.progressWidget.initGuiWidget(null, progressReady);
                this.progressWidget.setWidgetIconKey(progressIcon);
            }.bind(this);

            this.guiWidget.initGuiWidget(null, buttonReady);
        //    this.guiWidget.addOnActiaveCallback(onActivate);



        };


        GuiActionButton.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
            this.progressWidget.recoverGuiWidget();
        };

        GuiActionButton.prototype.attachActionToButton = function(action) {


            this.guiWidget.printWidgetText(action.name);
            this.guiWidget.setWidgetIconKey(action.icon);

        };

        GuiActionButton.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };

        return GuiActionButton;

    });