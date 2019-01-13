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


        ElementStateProcessor.applyElementLayout = function(widget) {
            layoutId = widget.getLayoutConfigId();
            layout =  GuiAPI.getGuiSettingConfig('SURFACE_LAYOUT', 'SURFACES', layoutId);

            widget.getWidgetSurface().getSurfaceExtents(widgetExtents);

            if (widget.parent) {
                widget.parent.getWidgetSurface().getSurfaceExtents(parentExtents);
                widgetOrigin.copy(widget.parent.pos);
            } else {
                parentExtents.set(1, 1, 1);
                widgetOrigin.copy(widget.pos);
            }

            offset.set(layout.offset.x * widgetExtents.x, layout.offset.y * widgetExtents.y, layout.offset.z * widgetExtents.z);
            anchor.set(layout.anchor.x * parentExtents.x, layout.anchor.y * parentExtents.y, layout.anchor.z * parentExtents.z);

            widgetOrigin.add(offset);
            widgetOrigin.add(anchor);
            widget.pos.copy(widgetOrigin);
            widget.size.copy(layout.size);
            if (widget.text) {
                widget.text.setTextLayout(layout.text)
            }

        };

        return ElementStateProcessor;

    });

