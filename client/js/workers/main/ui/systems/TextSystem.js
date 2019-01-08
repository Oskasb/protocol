"use strict";

define([
        'application/ExpandingPool',
        'client/js/workers/main/ui/elements/GuiTextElement'
    ],
    function(
        ExpandingPool,
        GuiTextElement
    ) {

        var tempVec1 = new THREE.Vector3();

        var TextSystem = function(spriteKey) {
            this.elements = [];

            this.spriteKey = spriteKey;

            var addElement = function(sysKey, callback) {
                var element = new GuiTextElement();
                callback(element)
            };

            this.expandingPool = new ExpandingPool('text_elements', addElement);
        };


        TextSystem.prototype.getSpriteKey = function() {
            return this.spriteKey;
        };

        TextSystem.prototype.addTextElement = function(element) {

            this.elements.unshift(element);

        };


        TextSystem.prototype.updateAllTextPositions = function() {

            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].updateElementPosition()
            }

        };


        TextSystem.prototype.removeTextElement = function(element) {

            element.recoverTextElement();
            this.expandingPool.returnToExpandingPool(element);

        };

        TextSystem.prototype.buildTextElement = function(cb, dataId, elementPos) {

            var getElement = function(elem) {

                elem.setElementAnchorPos(elementPos);
                elem.setElementDataKeys('TEXT_LAYOUT', this.spriteKey, dataId);

                cb(elem);
            }.bind(this);

            this.expandingPool.getFromExpandingPool(getElement)

        };

        return TextSystem;

    });