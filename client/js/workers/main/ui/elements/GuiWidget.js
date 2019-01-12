"use strict";

define([
        'client/js/workers/main/ui/states/ElementStateProcessor',
        'client/js/workers/main/ui/elements/GuiSurface'
    ],
    function(
        ElementStateProcessor,
        GuiSurface
    ) {

        var uiKey = 'WIDGET';
        var settingKey = "STANDARD_WIDGETS";


        var GuiWidget = function(configId) {

            this.configId = configId;

            this.pos    = new THREE.Vector3();
            this.quat = new THREE.Quaternion();

            this.guiSurface = new GuiSurface();
            this.text       = null;
            this.icon       = null;

            this.parent = null;
            this.children = [];


            var onStringReady = function() {
                this.notifyStringReady();
            }.bind(this);

            var onElementActivate = function(bool) {
                this.notifyElementActivate(bool);
            }.bind(this);

            this.callbacks = {
                onStringReady:onStringReady,
                onElementActivate:onElementActivate,
                onActivate:[]
            }

        };

        GuiWidget.prototype.initGuiWidget = function(pos, cb) {

            this.pos.copy(pos);

            var config = GuiAPI.getGuiSettings().getSettingConfig(uiKey, settingKey)[this.configId];

            this.setLayoutConfigId(config['layout']);

            var rq = 0;
            var rd = 0;

            var onWidgetStateUpdate = function() {
                this.updateWidgetStateFeedback();
            }.bind(this);

            var checkRd = function() {

                rd++;
                if (rq===rd) {

                    this.guiSurface.registerStateUpdateCallback(onWidgetStateUpdate);
                    //    this.guiSurface.applyStateFeedback();
                    GuiAPI.registerInteractiveGuiElement(this.guiSurface);
                    this.guiSurface.addOnActivateCallback(this.callbacks.onElementActivate);
                    cb(this);
                }

            }.bind(this);

            var surfaceReady = function() {

                rq++;

                if (config['text']) {
                    rq++;
                    this.initWidgetText(config.text, checkRd);
                }

                if (config['icon']) {
                    rq++;
                    this.initWidgetIcon(config.icon, checkRd);
                }

                checkRd();

            }.bind(this);


            if (config['surface']) {
                this.initWidgetSurface(config.surface, surfaceReady);
            } else {
                console.log("GuiWidget config requires a surface", config)
            }

        };

        GuiWidget.prototype.setLayoutConfigId = function(layoutConfigId) {
            this.layoutConfigId = layoutConfigId;
        };

        GuiWidget.prototype.getLayoutConfigId = function() {
            return this.layoutConfigId;
        };

        GuiWidget.prototype.initWidgetSurface = function(surfaceConf, surfaceReady) {

            var setupSurface = function() {
                surfaceReady();
            };

            this.guiSurface.setFeedbackConfigId(surfaceConf.feedback);
            this.guiSurface.setupSurfaceElement( surfaceConf['nineslice'] , setupSurface);

        };

        GuiWidget.prototype.initWidgetText = function(txtConf, cb) {

            var textCB = function (txtElem) {
                txtElem.setFeedbackConfigId(txtConf.feedback);
                this.text = txtElem;
                cb()
            }.bind(this);

            GuiAPI.getTextSystem().buildTextElement(textCB, txtConf.sprite_font);

        };


        GuiWidget.prototype.initWidgetIcon = function(iconConf, cb) {

        };

        GuiWidget.prototype.updateWidgetStateFeedback = function() {

            var state = this.guiSurface.getInteractiveState();
            ElementStateProcessor.applyElementStateFeedback(this.guiSurface, state);

            if (this.text) {
                if (this.text.guiStrings.length) {
                    ElementStateProcessor.applyStateToTextElement(this.text, state);
                }
            }
        };

        GuiWidget.prototype.updateSurfacePositions = function() {
            this.guiSurface.setSurfaceMinXY(this.text.minXY);
            this.guiSurface.setSurfaceMaxXY(this.text.maxXY);
            this.guiSurface.positionOnCenter();
            this.guiSurface.fitToExtents();
        };

        GuiWidget.prototype.notifyStringReady = function() {
            //    var state = this.guiSurface.getInteractiveState();
            //    ElementStateProcessor.applyStateToTextElement(this.text, state);
            this.text.updateTextMinMaxPositions(this.pos);
            this.updateSurfacePositions();

            this.updateWidgetStateFeedback();
        };

        GuiWidget.prototype.printWidgetText = function(string, size) {

            if (!this.text) {
                console.log("No text element present!", this);
                return;
            }

            this.text.drawTextString(GuiAPI.getTextSysKey(), string, size, this.callbacks.onStringReady);

        };

        GuiWidget.prototype.notifyElementActivate = function(bool) {

            for (var i = 0; i < this.callbacks.onActivate.length; i++) {
                this.callbacks.onActivate[i](bool)
            }

        };


        GuiWidget.prototype.addOnActiaveCallback = function(cb) {
            this.callbacks.onActivate.push(cb)
        };

        GuiWidget.prototype.removeOnActiaveCallback = function(cb) {
            this.callbacks.onActivate.splice(this.callbacks.onActivate.indexOf(cb), 1);
        };

        GuiWidget.prototype.getWidgetSurface = function() {
            return this.guiSurface;
        };

        GuiWidget.prototype.setPosition = function(pos) {
            this.pos.copy(pos);


            ElementStateProcessor.applyElementLayout(this);

            if (this.text) {
                this.text.updateTextMinMaxPositions(this.pos);
            }

            this.updateSurfacePositions();

            for (var i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(this.pos);
            }

        };

        GuiWidget.prototype.removeChild = function(guiWidget) {
            this.children.splice(this.children.indexOf(guiWidget), 1);
        };

        GuiWidget.prototype.addChild = function(guiWidget) {
            if (guiWidget.parent) {
                guiWidget.parent.removeChild(guiWidget)
            }
            guiWidget.parent = this;
            this.children.push(guiWidget);
        };


        GuiWidget.prototype.recoverGuiWidget = function() {

            this.guiSurface.recoverGuiSurface();

        };

        return GuiWidget;

    });