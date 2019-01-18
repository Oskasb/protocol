"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {



        var GuiExpandingContainer = function() {

            this.sizeX = 0;
            this.sizeY = 0;

        };


        GuiExpandingContainer.prototype.initExpandingContainer = function(widgetConfig, onReady) {
            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(null, onReady);

        };


        GuiExpandingContainer.prototype.removeGuiWidget = function() {

            this.guiWidget.removeChildren();
            this.guiWidget.recoverGuiWidget();
        };

        GuiExpandingContainer.prototype.addChildWidgetToContainer = function(guiWidget) {
            this.guiWidget.disableWidgetInteraction();
            this.guiWidget.addChild(guiWidget);

            this.fitContainerChildren()
        };

        GuiExpandingContainer.prototype.fitContainerChildren = function() {

            this.guiWidget.applyWidgetPosition()
        };

        GuiExpandingContainer.prototype.setTestActiveCallback = function(cb) {
            this.guiWidget.addTestActiveCallback(cb);
        };


        return GuiExpandingContainer;

    });