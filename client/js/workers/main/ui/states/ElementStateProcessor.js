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
            state_feedback = element.config['state_feedback'];

            if (state_feedback) {

                stateKey = ENUMS.getKey('ElementState', elementState);

                if (state_feedback[stateKey]) {

                    color = state_feedback[stateKey]['color_rgba'];
                    if (color) {

                        for (var i = 0; i < element.guiStrings.length; i++) {
                            element.guiStrings[i].setStringColorRGBA(color);
                        }
                    }
                }
            }
        };


        ElementStateProcessor.applyElementStateFeedback = function(element, elementState) {
            imgConf = element.config['image'];
            state_feedback = element.config['state_feedback'];
            if (imgConf) {
                if (state_feedback) {

                    stateKey = ENUMS.getKey('ElementState', elementState);

                    if (state_feedback[stateKey]) {

                        color = state_feedback[stateKey]['color_rgba'];
                        if (color) {
                            element.getBufferElement().setColorRGBA(color);
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

