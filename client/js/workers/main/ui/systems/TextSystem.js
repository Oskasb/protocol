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

            if (this.elements.length > 8) {
                var recoverElem = this.elements.pop();
                this.removeTextElement(recoverElem);
            }

            tempVec1.x = -0.8;
            tempVec1.y = -0.4;
            tempVec1.z = -1;

            for (var i = 0; i < this.elements.length; i++) {
                tempVec1.y += 0.04;
                this.elements[i].setElementPosition(tempVec1)
            }

        };

        TextSystem.prototype.removeTextElement = function(element) {

            element.recoverTextElement();
            this.expandingPool.returnToExpandingPool(element);

        };

        TextSystem.prototype.buildTextElement = function(cb) {

            var getElement = function(elem) {

                cb(elem);
            }.bind(this);

            this.expandingPool.getFromExpandingPool(getElement)

        };

        return TextSystem;

    });