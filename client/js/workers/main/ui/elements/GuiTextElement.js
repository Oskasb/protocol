"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiString'
    ],
    function(
        ExpandingPool,
        GuiString
    ) {

        var GuiTextElement = function() {

            this.guiStrings = [];

            this.anchorPosVec = new THREE.Vector3();

            this.minXY = new THREE.Vector3();
            this.maxXY = new THREE.Vector3();

            var addElement = function(sysKey, callback) {
                var element = new GuiString();
                callback(element)
            };

            this.guiStringPool = new ExpandingPool('strings', addElement);
        };

        GuiTextElement.prototype.removeGuiString = function(guiString) {

            guiString.recoverGuiString();
            this.guiStringPool.returnToExpandingPool(guiString);

        };

        GuiTextElement.prototype.drawTextString = function(uiSysKey, string, fontSize, cb) {

            var initString = function(guiString) {

                guiString.setString(string, uiSysKey, fontSize);
                this.guiStrings.push(guiString);
                this.updateTextMinMaxPositions()
                cb();
            }.bind(this);

                if (this.guiStrings.length > 4) {
                    this.removeGuiString(this.guiStrings.shift())
                }

                var getElement = function(elem) {
                    initString(elem)
                }.bind(this);

                this.guiStringPool.getFromExpandingPool(getElement)

        };

        GuiTextElement.prototype.setFeedbackConfigId = function(feedbackConfigId) {
            this.feedbackConfigId = feedbackConfigId;
        };

        GuiTextElement.prototype.getFeedbackConfigId = function() {
            return this.feedbackConfigId;
        };


        GuiTextElement.prototype.setElementDataKeys = function(uiKey, dataKey, dataId) {
            this.uiKey = uiKey;
            this.dataKey = dataKey;
            this.dataId = dataId;
            var config = GuiAPI.getGuiSettingConfig(this.uiKey, this.dataKey, this.dataId);
            this.setElementConfig(config);
        };

        GuiTextElement.prototype.setElementConfig = function(config) {
            this.config = config;
        };


        GuiTextElement.prototype.setElementAnchorPos = function(posV) {
            this.anchorPosVec.copy(posV);
        };

        GuiTextElement.prototype.updateTextMinMaxPositions = function() {

            this.config = GuiAPI.getGuiSettingConfig(this.uiKey, this.dataKey, this.dataId);

            this.minXY.copy(this.anchorPosVec);
            this.maxXY.copy(this.anchorPosVec);

                var letterW = this.config['letter_width'];
                var letterH = this.config['letter_height'];

                var maxW = 0;
                var maxH = 0;

            for (var i = 0; i < this.guiStrings.length; i++) {

                this.guiStrings[i].setStringPosition(this.anchorPosVec, letterW, letterH, this.config['row_spacing'], i);

                if (this.guiStrings[i].maxXY.x > maxW) {
                    maxW = this.guiStrings[i].maxXY.x;
                }

                maxH = this.guiStrings[i].maxXY.y

            }

            this.maxXY.x = maxW;
            this.maxXY.y = maxH ;

        };


        GuiTextElement.prototype.recoverTextElement = function() {

            while (this.guiStrings.length) {

                var guiString = this.guiStrings.shift();
                guiString.recoverGuiString();
                this.guiStringPool.returnToExpandingPool(guiString);
            }

        };

        return GuiTextElement;

    });