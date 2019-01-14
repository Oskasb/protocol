"use strict";

define([

    ],
    function(

    ) {

        var GuiIcon = function() {
            this.pos = new THREE.Vector3();
            this.innersize = new THREE.Vector3();
            this.offset = new THREE.Vector3();



            this.progressMin = 0;
            this.progressMax = 1;
            this.progressCurrent = 0;

            this.scale = {x:0, y:0, z:0};
            this.sprite = {x:0, y:0, z:0, w:0};

            this.iconKey = 'debug_nine';

            this.uiKey = 'ICON_ELEMENTS';
            this.sysKey = 'UI_ELEMENTS_MAIN';
            this.atlasKey = 'GUI_16x16';
            this.configId = '';
        };

        GuiIcon.prototype.initIconBuffers = function(bufferElement) {

            this.bufferElement = bufferElement;
            this.bufferElement.pos.z = 1;

            this.bufferElement.lifecycle.x = 0;
            this.bufferElement.lifecycle.y = 0;
            this.bufferElement.lifecycle.z = 0;
            this.bufferElement.lifecycle.w = 0;

        };

        GuiIcon.prototype.setConfigParams = function(configId) {
            this.configId = configId;
            this.iconSprites = GuiAPI.getUiSprites(this.atlasKey);
        };

        GuiIcon.prototype.setFeedbackConfigId = function(feedbackConfigId) {
            this.feedbackConfigId = feedbackConfigId;
        };

        GuiIcon.prototype.getFeedbackConfigId = function() {
            return this.feedbackConfigId;
        };


        GuiIcon.prototype.setIconKey = function(iconKey) {
            this.iconKey = iconKey;
            this.applyIconSprite()
        };

        GuiIcon.prototype.applyIconSprite = function() {
            this.iconSprite = this.iconSprites[this.iconKey];
            this.setSpriteXY(this.iconSprite[0], this.iconSprite[1])
        };


        GuiIcon.prototype.getLetter = function() {
            return this.letter;
        };

        GuiIcon.prototype.setSpriteXY = function(x, y) {
            this.sprite.x = x;
            this.sprite.y = y;
            this.bufferElement.setSprite(this.sprite)
        };


        GuiIcon.prototype.updateGuiIconPosition = function(parentPos, parentSize) {

            this.pos.copy(parentSize);
            this.pos.multiplyScalar(0.5);
            this.pos.add(parentPos);

            this.config = GuiAPI.getGuiSettingConfig(this.uiKey, this.atlasKey, this.configId);


            if (this.config.innersize) {
                this.innersize.copy(this.config.innersize);
            } else {
                this.innersize.set(1, 1, 1);
            }

            if (this.config.stretch) {
                this.innersize.multiply(parentSize);
            } else {
                var smallestSide = Math.min(parentSize.x * this.innersize.x, parentSize.y * this.innersize.y);
                this.innersize.multiplyScalar(smallestSide);
            }


            var marginW = parentSize.x - this.innersize.x ;
            var marginH = parentSize.y - this.innersize.y ;

            if (this.config.offset) {

                var displaceW = (this.config.offset.x-0.5) * marginW;
                var displaceH = (this.config.offset.y-0.5) * marginH;

                this.offset.set(
                    displaceW,
                    displaceH,
                    this.config.offset.z
                );

            } else {
                this.offset.set(0, 0, 0);
            }


            if (this.config['progress']) {
                if (this.progressCurrent < this.progressMax) {
                    var axis = this.config.progress.axis;
                    var fraction = MATH.calcFraction(this.progressMin, this.progressMax, this.progressCurrent);
                    var progOffset = 0;

                    if (axis === 'up') {
                        progOffset = fraction * this.innersize.y;

                        this.offset.y += progOffset* 0.5 - this.innersize.y*0.5;

                        this.innersize.y *= fraction;
                    }

                    if (axis === 'down') {
                        progOffset = fraction * this.innersize.y;

                        this.offset.y -= progOffset* 0.5 + this.innersize.y*0.5;

                        this.innersize.y *= fraction;
                    }

                    if (axis === 'left') {
                        progOffset = fraction * this.innersize.x;

                        this.offset.x += progOffset* 0.5 - this.innersize.x*0.5;

                        this.innersize.x *= fraction;
                    }

                    if (axis === 'right') {
                        progOffset = fraction * this.innersize.x;

                        this.offset.x -= progOffset* 0.5 + this.innersize.x*0.5;

                        this.innersize.x *= fraction;
                    }

                }
            }



            this.pos.add(this.offset);
            this.applyIconSprite();
            this.setGuiIconScaleXY(this.innersize.x , this.innersize.y );
            this.applyGuiIconPosition();

        };

        GuiIcon.prototype.setIconProgressState = function(min, max, current) {

            this.progressMin = min;
            this.progressMax = max;
            this.progressCurrent = current;

        };

        GuiIcon.prototype.applyGuiIconPosition = function() {
            this.bufferElement.setPositionVec3(this.pos)
        };

        GuiIcon.prototype.setGuiIconColorRGBA = function(rgba) {
            this.bufferElement.setColorRGBA(rgba)
        };

        GuiIcon.prototype.setGuiIconSprite = function(xyzw) {
            this.bufferElement.setSprite(xyzw)
        };

        GuiIcon.prototype.setGuiIconLutColor = function(value) {
            this.bufferElement.setLutColor(value);
            this.bufferElement.applyDataTexture()
        };


        GuiIcon.prototype.setGuiIconScaleXY = function(x, y) {
            this.scale.x = x * 10;
            this.scale.y = y * 10;
            this.bufferElement.setScaleVec3(this.scale)
        };

        GuiIcon.prototype.setGuiIconReleaseTime = function(time) {
            this.bufferElement.setReleaseTime(time)
        };

        GuiIcon.prototype.releaseGuiIcon = function() {
            this.bufferElement.releaseElement()
        };


        return GuiIcon;

    });