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

        var TextSystem = function() {
            this.elements = [];

            var addElement = function(sysKey, callback) {
                var element = new GuiTextElement();
                callback(element)
            };

            this.expandingPool = new ExpandingPool('text_elements', addElement);
        };




        TextSystem.prototype.addTextElement = function(element) {

            this.elements.push(element);

            if (this.elements.length > 27) {
                var recoverElem = this.elements.shift();
                this.removeTextElement(recoverElem);
            }

            tempVec1.x = -0.8;
            tempVec1.y = -0.4;
            tempVec1.z = -1;

            for (var i = 0; i < this.elements.length; i++) {
                tempVec1.y += 0.03;
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