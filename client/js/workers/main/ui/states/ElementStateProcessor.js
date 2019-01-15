"use strict";

define([

    ],
    function(

    ) {

        var imgConf;
        var state_feedback;
        var stateKey;
        var color;
        var sprites;
        var sprite;
        var spriteName;

        var lutColor;
        var bufferElem;
        var feedbackId;

        var ElementStateProcessor = function() {

        };

        ElementStateProcessor.applyStateToTextElement = function(element, elementState) {
            feedbackId = element.getFeedbackConfigId();
            state_feedback =  GuiAPI.getGuiSettingConfig('FEEDBACK', 'TEXT', feedbackId);

            if (state_feedback) {

                stateKey = ENUMS.getKey('ElementState', elementState);

                if (state_feedback[stateKey]) {

                    color = state_feedback[stateKey]['color_rgba'];
                    if (color) {

                        for (var i = 0; i < element.guiStrings.length; i++) {
                            element.guiStrings[i].setStringColorRGBA(color, state_feedback[stateKey]['lut_color']);
                        }
                    }
                }
            }
        };

        ElementStateProcessor.applyStateToIconElement = function(element, elementState) {
            feedbackId = element.getFeedbackConfigId();
            state_feedback =  GuiAPI.getGuiSettingConfig('FEEDBACK', 'ICON', feedbackId);

            if (state_feedback) {

                stateKey = ENUMS.getKey('ElementState', elementState);

                if (state_feedback[stateKey]) {

                    color = state_feedback[stateKey]['color_rgba'];
                    if (color) {
                        element.setGuiIconColorRGBA(color);
                    }
                }
            }
        };

        ElementStateProcessor.applyElementStateFeedback = function(element, elementState) {
            imgConf = element.config['image'];
            feedbackId = element.getFeedbackConfigId();
            state_feedback =  GuiAPI.getGuiSettingConfig('FEEDBACK', 'SURFACE', feedbackId);

            if (imgConf) {
                if (state_feedback) {

                    stateKey = ENUMS.getKey('ElementState', elementState);

                    if (state_feedback[stateKey]) {
                        bufferElem = element.getBufferElement();


                        color = state_feedback[stateKey]['color_rgba'];
                        if (color) {
                            bufferElem.setColorRGBA(color);
                        }

                        lutColor = state_feedback[stateKey]['lut_color'];

                        if (lutColor) {
                            bufferElem.setLutColor(ENUMS.ColorCurve[lutColor]);
                            bufferElem.applyDataTexture();
                        }


                        spriteName = state_feedback[stateKey]['sprite'];

                        if (spriteName) {

                            sprites = GuiAPI.getUiSprites(imgConf['atlas_key']);
                            sprite = sprites[spriteName];

                            element.sprite.x = sprite[0];
                            element.sprite.y = sprite[1];

                            element.getBufferElement().setSprite(element.sprite);

                        }
                    }
                }
            }
        };

        var layoutId;
        var layout;


        var offset = new THREE.Vector3();
        var anchor = new THREE.Vector3();
        var widgetOrigin = new THREE.Vector3();
        var widgetExtents = new THREE.Vector3();
        var parentExtents = new THREE.Vector3();

        var screenPos = new THREE.Vector3();

        ElementStateProcessor.applyElementLayout = function(widget) {
            layoutId = widget.getLayoutConfigId();
            layout =  GuiAPI.getGuiSettingConfig('SURFACE_LAYOUT', 'SURFACES', layoutId);

            widget.getWidgetSurface().getSurfaceExtents(widgetExtents);

            if (widget.parent) {
                widget.parent.getWidgetSurface().getSurfaceExtents(parentExtents);
                widgetOrigin.copy(widget.parent.originalPosition);
            } else {
                parentExtents.set(1, 1, 1);
                  GuiAPI.applyAspectToScreenPosition(widget.originalPosition, widgetOrigin);
            };


            if (layout.offset.center) {

                if (widget.parent) {
                    widget.pos.copy(widget.parent.pos);
                }

            } else {
                offset.set(layout.offset.x * widgetExtents.x, layout.offset.y * widgetExtents.y, layout.offset.z * widgetExtents.z);
                anchor.set(layout.anchor.x * parentExtents.x, layout.anchor.y * parentExtents.y, layout.anchor.z * parentExtents.z);
                widgetOrigin.add(offset);
                widgetOrigin.add(anchor);
                widget.pos.copy(widgetOrigin);
            }


            widget.pos.add(widget.offsetPosition);

            layoutSize(widget, layout);

            if (widget.text) {
                widget.text.setTextLayout(layout.text)
            }

        };

        var layoutSize = function(widget, layout) {

            if (layout.size.x === 'auto') {
                layoutGridX(widget, layout)
            } else {
                widget.size.x = layout.size.x;
            }

            if (layout.size.y === 'auto') {

            } else {
                widget.size.y = layout.size.y;
            }

            widget.size.z = layout.size.z;

        };

        var child;
        var children;
        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();
        var tempMin = new THREE.Vector3();
        var tempMax = new THREE.Vector3();

        var gridMinXY = new THREE.Vector3();
        var gridMaxXY = new THREE.Vector3();
        var gridSize = new THREE.Vector3();

        var padx = 0;
        var pady = 0;
        var columns;
        var col;
        var row;
        var gridX;
        var gridY;

        var osx;
        var osy;

        var layoutGridX = function(widget, layout) {

            children = widget.children;

            tempVec1.set(0, 0, 0);
            gridMinXY.set(9, 9, 0);
            gridMaxXY.set( -9,  -9, 0);

            gridX = layout.size.gridx || 1;
            gridY = layout.size.gridy || 1;

            padx = layout.size.pad || 0;
            pady = layout.size.pad || 0;
            columns = layout.size.cols || 1;

            col = 0;
            row = 0;

            for (var i = 0; i < children.length; i++) {
                child = children[i];
                child.getWidgetOuterSize(tempVec2);

                col = i % columns;
                row = Math.floor(i / columns) +1;

                osx = (tempVec2.x+padx)*col;
                osy = (tempVec2.y+pady)*row;

                tempVec1.x = osx*gridX;
                tempVec1.y = osy*gridY;

                child.offsetWidgetPosition(tempVec1);
                child.getWidgetMinMax(tempMin, tempMax);

                if (gridMinXY.x > tempMin.x-padx) {
                    gridMinXY.x = tempMin.x-padx
                }

                if (gridMinXY.y > tempMin.y-pady) {
                    gridMinXY.y = tempMin.y-pady
                }

                if (gridMaxXY.x < tempMax.x+padx) {
                    gridMaxXY.x = tempMax.x+padx
                }

                if (gridMaxXY.y < tempMax.y+pady) {
                    gridMaxXY.y = tempMax.y+pady
                }

            }

            gridSize.subVectors(gridMaxXY, gridMinXY);

            widget.size.copy(gridSize);

            gridSize.multiplyScalar(0.5);

            widget.pos.copy(gridMinXY);
            widget.pos.add(gridSize);

        };

        var layoutGridY = function(widget, layout) {

        }

        return ElementStateProcessor;

    });

