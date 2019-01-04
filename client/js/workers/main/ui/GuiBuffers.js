"use strict";

define([

    ],
    function(

    ) {

    var buffer;
    var dims;
    var idx;

        var attributes = {
            "offset"         : { "dimensions":3, "dynamic":false},
            "startTime"      : { "dimensions":1, "dynamic":true },
            "duration"       : { "dimensions":1, "dynamic":false},
            "texelRowSelect" : { "dimensions":4, "dynamic":false},
            "tileindex"      : { "dimensions":2                 },
            "sprite"         : { "dimensions":4, "dynamic":false},
            "lifecycle"      : { "dimensions":4, "dynamic":false},
            "diffusors"      : { "dimensions":4, "dynamic":false},
            "vertexColor"    : { "dimensions":4, "dynamic":false},
            "scale3d"        : { "dimensions":3, "dynamic":false},
            "orientation"    : { "dimensions":4, "dynamic":false}
        };

        var useBuffers = [
            "offset",
            "scale3d",
            "vertexColor",
            "orientation",
            "sprite",
            "lifecycle"
        ];

        var GuiBuffers = function(uiSysKey, assetId, elementCount) {
            this.uiSysKey = uiSysKey;
            this.assetId = assetId;
            this.buffers = {};
            this.releasedElements = [];
            this.removes = [];
            this.availableIndex = [];
            this.activeElements = [];
            this.needsUpdate = false;
            this.initAttributeBuffers(elementCount);
        };


        GuiBuffers.prototype.initAttributeBuffers = function(elementCount) {
            var buffers = [];

            for (var i = 0; i < useBuffers.length; i++) {
                var attrib = attributes[useBuffers[i]];
                var sab = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * elementCount * attrib.dimensions);
                var buffer = new Float32Array(sab);
                buffers.push(buffer);
                this.buffers[useBuffers[i]] = buffer;
            };

            var msg = [this.uiSysKey, this.assetId, useBuffers, buffers];
            MainWorldAPI.postToRender([ENUMS.Message.REGISTER_UI_BUFFERS, msg])

        };

        GuiBuffers.prototype.setAttribX = function(name, index, x) {

            buffer = this.buffers[name];
            dims = attributes[name].dimensions;
            idx = dims*index;
            buffer[idx] = x;
            this.setUpdated(buffer);
        };

        GuiBuffers.prototype.setAttribXY = function(name, index, x, y) {
            buffer = this.buffers[name];
            dims = attributes[name].dimensions;
            idx = dims*index;
            buffer[idx] = x;
            buffer[idx+1] = y;
            this.setUpdated(buffer);
        };

        GuiBuffers.prototype.setAttribXYZ = function(name, index, x, y, z) {

            buffer = this.buffers[name];
            dims = attributes[name].dimensions;
            idx = dims*index;
            buffer[idx] = x;
            buffer[idx+1] = y;
            buffer[idx+2] = z;
            this.setUpdated(buffer);
        };

        GuiBuffers.prototype.setAttribXYZW = function(name, index, x, y, z, w) {

            buffer = this.buffers[name];
            dims = attributes[name].dimensions;
            idx = dims*index;
            buffer[idx] = x;
            buffer[idx+1] = y;
            buffer[idx+2] = z;
            buffer[idx+3] = w;
            this.setUpdated(buffer);
        };

        GuiBuffers.prototype.getSystemTime = function() {
            buffer = this.buffers['offset'];
            return buffer[buffer.length - 2];
        };

        GuiBuffers.prototype.setUpdated = function(buffer) {
            buffer[buffer.length-1] = 1
        };

        var element;
        var i;

        GuiBuffers.prototype.updateGuiBuffer = function() {

            for (i = 0; i < this.releasedElements.length; i++) {
                element = this.releasedElements[i];
                if (element.testLifetimeIsOver()) {
                    this.removes.push(element);
                }
            }

            while (this.removes.length) {
                element = this.removes.pop();
                this.recoverElement(element);
                this.releasedElements.splice(this.releasedElements.indexOf(element), 1)
            }

        //    if (!this.needsUpdate) return;
/*
            for (var i = 0;i < this.activeElements.length; i++) {
                this.activeElements[i].setIndex(i);
            }
*/

        //    this.updateDrawRange();
        };



        GuiBuffers.prototype.setElementReleased = function(guiElement) {
            guiElement.endLifecycleNow();
            this.releasedElements.push(guiElement);
        };

        GuiBuffers.prototype.recoverElement = function(guiElement) {
            this.returnAvailableIndex(guiElement.index);
            this.activeElements.splice(this.activeElements.indexOf(guiElement), 1);
        };


        var currentDrawRange;

        GuiBuffers.prototype.getCurrentDrawRange = function() {
            buffer = this.buffers['offset'];
            return buffer[buffer.length-3];
        };

        GuiBuffers.prototype.updateDrawRange = function(testIndex) {

            currentDrawRange = this.getCurrentDrawRange();
            if (currentDrawRange < testIndex) {
                buffer[buffer.length-3] = testIndex;
            }

        };

        GuiBuffers.prototype.returnAvailableIndex = function(idx) {
            this.availableIndex.unshift(idx);
        };

        var availableIndex;

        GuiBuffers.prototype.getAvailableIndex = function() {

            availableIndex = this.availableIndex.pop();

            if (typeof(availableIndex) !== 'number') {
                availableIndex = this.getCurrentDrawRange()
            }

            this.updateDrawRange(availableIndex+1);
            return availableIndex;
        };


        GuiBuffers.prototype.registerElement = function(guiElement) {

            this.activeElements.push(guiElement);
            return this.getAvailableIndex()

        };

        return GuiBuffers;

    });