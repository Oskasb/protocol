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

var lutColor;
var bufferElem;
var feedbackId;
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



        return ElementStateProcessor;

    });

