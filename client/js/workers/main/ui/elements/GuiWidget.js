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
            this.originalPosition = new THREE.Vector3();
            this.offsetPosition = new THREE.Vector3();
            this.size = new THREE.Vector3();
            this.extents = new THREE.Vector3();
            this.quat = new THREE.Quaternion();

            this.guiSurface = new GuiSurface();
            this.text       = null;
            this.icon       = null;

            this.parent = null;
            this.children = [];


            var onAspectChange = function() {
                this.notifyAspectChange();
            }.bind(this);

            var onStringReady = function() {
                this.notifyStringReady();
            }.bind(this);

            var onElementActivate = function(inputIndex) {
                this.notifyElementActivate(inputIndex);
            }.bind(this);

            var onElementPressStart = function(inputIndex) {
                this.notifyElementPressStart(inputIndex);
            }.bind(this);

            var testWidgetIsActive = function() {
                return this.testElementIsActive();
            }.bind(this);



            this.callbacks = {
                onAspectChange:onAspectChange,
                onStringReady:onStringReady,
                onElementActivate:onElementActivate,
                onElementPressStart:onElementPressStart,
                testWidgetIsActive:testWidgetIsActive,
                testActive:[],
                onActivate:[],
                onPressStart:[]
            }
        };



        GuiWidget.prototype.initGuiWidget = function(pos, cb) {

            if (pos) {
                this.originalPosition.copy(pos);
            } else {
                this.originalPosition.set(0, 0, 0);
            }

            this.offsetPosition.set(0, 0, 0);

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
                    GuiAPI.addAspectUpdateCallback(this.callbacks.onAspectChange);
                    this.guiSurface.addOnActivateCallback(this.callbacks.onElementActivate);
                    this.guiSurface.addOnPressStartCallback(this.callbacks.onElementPressStart);
                    this.guiSurface.setTestActiveCallback(this.callbacks.testWidgetIsActive);
                    this.updateWidgetStateFeedback();
                    this.setPosition(this.originalPosition);
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
            this.text.updateTextMinMaxPositions(this.guiSurface);
        };

        GuiWidget.prototype.updateSurfacePositions = function() {

            this.guiSurface.setSurfaceCenterAndSize(this.pos, this.size);
            this.guiSurface.positionOnCenter();
            this.guiSurface.fitToExtents();
        };


        GuiWidget.prototype.notifyAspectChange = function() {
            //    var state = this.guiSurface.getInteractiveState();
            //    ElementStateProcessor.applyStateToTextElement(this.text, state);
            this.setPosition(this.originalPosition);
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

        GuiWidget.prototype.notifyElementActivate = function(inputIndex) {

            for (var i = 0; i < this.callbacks.onActivate.length; i++) {
                this.callbacks.onActivate[i](inputIndex, this)
            }

        };


        GuiWidget.prototype.addOnActiaveCallback = function(cb) {
            this.callbacks.onActivate.push(cb)
        };

        GuiWidget.prototype.removeOnActiaveCallback = function(cb) {
            MATH.quickSplice(this.callbacks.onActivate, cb);
        };


        GuiWidget.prototype.notifyElementPressStart = function(inputIndex) {

            for (var i = 0; i < this.callbacks.onPressStart.length; i++) {
                this.callbacks.onPressStart[i](inputIndex, this)
            }

        };


        GuiWidget.prototype.addOnPressStartCallback = function(cb) {
            this.callbacks.onPressStart.push(cb)
        };

        GuiWidget.prototype.removePressStartCallback = function(cb) {
            MATH.quickSplice(this.callbacks.onPressStart, cb);
        };


        GuiWidget.prototype.testElementIsActive = function() {

            var active = false;

            for (var i = 0; i < this.callbacks.testActive.length; i++) {
                if (this.callbacks.testActive[i](this)) {
                    active = true;
                }
            }

            return active;
        };

        GuiWidget.prototype.addTestActiveCallback = function(cb) {
            this.callbacks.testActive.push(cb)
        };

        GuiWidget.prototype.removeTestActiveCallback = function(cb) {
            MATH.quickSplice(this.callbacks.testActive, cb);
        };



        GuiWidget.prototype.getWidgetSurface = function() {
            return this.guiSurface;
        };

        GuiWidget.prototype.getWidgetOuterSize = function(store) {
            this.guiSurface.getSurfaceExtents(store)
        };

        GuiWidget.prototype.getWidgetMinMax = function(minXY, maxXY) {
            minXY.copy(this.guiSurface.minXY);
            maxXY.copy(this.guiSurface.maxXY);
        };

        GuiWidget.prototype.setPosition = function(pos) {
            this.originalPosition.copy(pos);
            this.applyWidgetPosition();
        };


        GuiWidget.prototype.offsetWidgetPosition = function(offset) {
            this.offsetPosition.copy(offset);
            this.applyWidgetPosition();
        };

        GuiWidget.prototype.applyWidgetPosition = function() {
            GuiAPI.debugDrawGuiPosition(this.originalPosition.x, this.originalPosition.y);

            ElementStateProcessor.applyElementLayout(this);

            GuiAPI.debugDrawGuiPosition(this.pos.x, this.pos.y);

            this.updateSurfacePositions();

            if (this.text) {
                this.updateTextPositions();
            }

            if (this.icon) {
                this.updateIconPosition();
            }

            for (var i = 0; i < this.children.length; i++) {
                this.children[i].setPosition(this.pos);
            }

        };

        GuiWidget.prototype.removeChild = function(guiWidget) {
            MATH.quickSplice(this.children, guiWidget);
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

        GuiWidget.prototype.enableWidgetInteraction = function() {
            this.interactive = true;
            GuiAPI.registerInteractiveGuiElement(this.guiSurface);
        };

        GuiWidget.prototype.disableWidgetInteraction = function() {
            if (this.interactive) {
                GuiAPI.unregisterInteractiveGuiElement(this.guiSurface);
                this.interactive = false;
            }

        };

        GuiWidget.prototype.recoverGuiWidget = function() {
            this.disableWidgetInteraction();
            GuiAPI.removeAspectUpdateCallback(this.callbacks.onAspectChange);

            this.guiSurface.recoverGuiSurface();

            if (this.text) {
                this.text.recoverTextElement();
            }

            if (this.icon) {
                this.icon.releaseGuiIcon();
            }

            while (this.callbacks.onActivate.length) {
                this.callbacks.onActivate.pop()
            }

            while (this.callbacks.onPressStart.length) {
                this.callbacks.onPressStart.pop()
            }

            while (this.callbacks.testActive.length) {
                this.callbacks.testActive.pop()
            }

        };

        return GuiWidget;

    });