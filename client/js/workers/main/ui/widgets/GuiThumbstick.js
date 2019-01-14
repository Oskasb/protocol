"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget'
    ],
    function(
        GuiWidget
    ) {


        var GuiThumbstick = function() {
            this.origin = new THREE.Vector3();
            this.pos = new THREE.Vector3();
        };


        GuiThumbstick.prototype.initThumbstick = function(widgetConfig, onReady) {

            var widgetRdy = function(widget) {
                widget.setWidgetIconKey('directional_arrows');
                onReady(this)
            }.bind(this);

            this.guiWidget = new GuiWidget(widgetConfig);
            this.guiWidget.initGuiWidget(null, widgetRdy);
        };


        GuiThumbstick.prototype.setOriginPosition = function(pos) {
            this.origin.copy(pos);
            this.pos.copy(pos);
            this.guiWidget.setPosition(pos);
        };



        GuiThumbstick.prototype.removeGuiWidget = function() {
            this.guiWidget.recoverGuiWidget();
        };


        return GuiThumbstick;

    });