"use strict";

define([
        'client/js/workers/main/ui/states/ElementStateProcessor',
        'client/js/workers/main/ui/elements/GuiSurface',
        'client/js/workers/main/ui/elements/GuiIcon'
    ],
    function(
        ElementStateProcessor,
        GuiSurface,
        GuiIcon
    ) {

        var uiKey = 'WIDGET';
        var settingKey = "STANDARD_WIDGETS";


        var GuiWidget = function(configId) {

            this.configId = configId;

            this.pos  = new THREE.Vector3();
            this.size = new THREE.Vector3();
            this.extents = new THREE.Vector3();
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

            if (pos) {
                this.pos.copy(pos);
            }

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
                    this.updateWidgetStateFeedback();
                    this.setPosition(this.pos);
                    if (typeof (cb) === 'function') {
                        cb(this);
                    }
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

            var addLetterCb = function(bufferElem) {
                this.icon.initIconBuffers(bufferElem);
                cb()
            }.bind(this);

            this.icon = new GuiIcon();
            this.icon.setFeedbackConfigId(iconConf.feedback);
            this.icon.setConfigParams(iconConf.icon_config);

            GuiAPI.buildBufferElement(this.icon.sysKey, addLetterCb)

        };

        GuiWidget.prototype.updateWidgetStateFeedback = function() {

            var state = this.guiSurface.getInteractiveState();
            ElementStateProcessor.applyElementStateFeedback(this.guiSurface, state);

            if (this.text) {
                if (this.text.guiStrings.length) {
                    ElementStateProcessor.applyStateToTextElement(this.text, state);
                }
            }

            if (this.icon) {
                ElementStateProcessor.applyStateToIconElement(this.icon, state);
            }

        };

        GuiWidget.prototype.updateIconPosition = function() {
            this.guiSurface.getSurfaceExtents(this.extents);
            this.icon.updateGuiIconPosition(this.guiSurface.minXY, this.extents);
        };

        GuiWidget.prototype.updateTextPositions = function() {
            this.text.updateTextMinMaxPositions(this.pos, this.size);
        };

        GuiWidget.prototype.updateSurfacePositions = function() {
            this.guiSurface.setSurfaceMinXY(this.pos);
            this.guiSurface.applySurfaceSize(this.size);
            this.guiSurface.positionOnCenter();
            this.guiSurface.fitToExtents();
        };

        GuiWidget.prototype.notifyStringReady = function() {
            //    var state = this.guiSurface.getInteractiveState();
            //    ElementStateProcessor.applyStateToTextElement(this.text, state);
            this.updateTextPositions();
            this.updateSurfacePositions();

            this.updateWidgetStateFeedback();
        };

        GuiWidget.prototype.printWidgetText = function(string) {

            if (!this.text) {
                console.log("No text element present!", this);
                return;
            }

            this.text.drawTextString(GuiAPI.getTextSysKey(), string, this.callbacks.onStringReady);
        };

        GuiWidget.prototype.notifyElementActivate = function(bool) {

            for (var i = 0; i < this.callbacks.onActivate.length; i++) {
                this.callbacks.onActivate[i](bool, this)
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
                this.updateTextPositions();
            }

            this.updateSurfacePositions();

            if (this.icon) {
                this.updateIconPosition();
            }

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
            guiWidget.setPosition(this.pos);
            this.children.push(guiWidget);
        };

        GuiWidget.prototype.detatchFromParent = function() {

            if (this.parent) {
                this.parent.removeChild(this)
            }
        };


        GuiWidget.prototype.setWidgetIconKey = function(iconKey) {

            if (!this.icon) {
                console.log("Widget requires icon configureation", iconKey, this);
                return;
            }

            this.icon.setIconKey(iconKey);

        };


        var progString = '';

        GuiWidget.prototype.indicateProgress = function(min, max, current, digits) {


            if (this.text) {

                progString = parseFloat((current%max).toFixed(digits)).toLocaleString().replace(/\.([0-9])$/, ".$10")


                if (this.text.guiStrings.length) {
                    this.text.guiStrings[0].setString(progString, this.text.uiSysKey);
                    this.updateTextPositions();
                } else {
                    this.printWidgetText(progString);
                }

            }

            if (this.icon) {
                this.icon.setIconProgressState(min, max, current%max);
                this.updateIconPosition();
            }


        };

        GuiWidget.prototype.recoverGuiWidget = function() {

            GuiAPI.unregisterInteractiveGuiElement(this.guiSurface);

            this.guiSurface.recoverGuiSurface();

            if (this.text) {
                this.text.recoverTextElement();
            }

            if (this.icon) {
                this.icon.releaseGuiIcon();
            }

        };

        return GuiWidget;

    });