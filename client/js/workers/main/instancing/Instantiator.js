"use strict";

var GuiAPI;

define([
        'application/ExpandingPool',
        'workers/main/instancing/InstancingBuffers',
        'workers/main/instancing/InstancingBufferElement'
    ],
    function(
        ExpandingPool,
        InstancingBuffers,
        InstancingBufferElement
    ) {


        var Instantiator = function() {

            this.elementPools = {};
            this.elementBuffers = {};

            var elementBuffers = this.elementBuffers;
            var elementPools = this.elementPools;

            var buildElement = function(sysKey, cb) {

                var getElement = function(key, elem) {
                    elem.initGuiBufferElement(elementBuffers[key]);
                    cb(elem);
                };

                elementPools[sysKey].getFromExpandingPool(getElement)
            };

            this.callbacks = {
                buildElement:buildElement,
            }

        };


        Instantiator.prototype.addInstanceSystem = function(elementKey, bufferSysKey, assetId, poolSize, renderOrder) {

                this.elementBuffers[elementKey] = new InstancingBuffers(bufferSysKey, assetId, poolSize, renderOrder);

                var addElement = function(poolKey, callback) {
                    var element = new InstancingBufferElement();
                    callback(poolKey, element)
                };
                this.elementPools[elementKey] = new ExpandingPool(elementKey, addElement);
            };

        Instantiator.prototype.buildBufferElement = function(sysKey, cb) {
            this.callbacks.buildElement(sysKey, cb);
        };


        Instantiator.prototype.updateInstantiatorBuffers = function() {

            for (var key in this.elementBuffers) {
                this.elementBuffers[key].updateGuiBuffer()
            }

        };

        Instantiator.prototype.monitorBufferStats = function() {
            InstancingBuffers.monitorBufferStats();
        };

        return Instantiator;

    });