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
            "lifecycle",
            "texelRowSelect"
        ];

        var GuiBuffers = function(uiSysKey, assetId, elementCount, renderOrder) {
            this.highestRenderingIndex = 0;
            this.activeCount = 0;

            this.renderOrder = renderOrder;

            this.elementBook = [];
            this.elementBook[ENUMS.IndexState.INDEX_BOOKED] = [];
            this.elementBook[ENUMS.IndexState.INDEX_RELEASING] = [];
            this.elementBook[ENUMS.IndexState.INDEX_FRAME_CLEANUP] = [];
            this.elementBook[ENUMS.IndexState.INDEX_AVAILABLE] = [];


            this.uiSysKey = uiSysKey;
            this.assetId = assetId;
            this.buffers = {};
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

            var msg = [this.uiSysKey, this.assetId, useBuffers, buffers, this.renderOrder];
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
        var clears;
        var elemIndex;

        GuiBuffers.prototype.updateReleaseIndices = function(releasedIndices) {
            while (releasedIndices.length) {
                elemIndex = releasedIndices.pop();
                element = this.activeElements[elemIndex];
                if (element.testLifetimeIsOver(this.getSystemTime())) {
                    this.activeCount--;
                    this.setIndexBookState(elemIndex, ENUMS.IndexState.INDEX_AVAILABLE);
                } else {
                    this.setIndexBookState(elemIndex, ENUMS.IndexState.INDEX_FRAME_CLEANUP);
                }
            }
        };

        GuiBuffers.prototype.updateCleanupIndices = function(cleanupIndices) {
            while (cleanupIndices.length) {
                elemIndex = cleanupIndices.pop();
                this.setIndexBookState(elemIndex, ENUMS.IndexState.INDEX_RELEASING);
            }
        };


        GuiBuffers.prototype.updateActiveCount = function() {

            if (!this.activeCount) {
                this.highestRenderingIndex = -1;
                this.updateDrawRange();
                clears = this.getBookState(ENUMS.IndexState.INDEX_RELEASING);
                while (clears.length) {
                    clears.pop();
                }
                clears = this.getBookState(ENUMS.IndexState.INDEX_FRAME_CLEANUP);
                while (clears.length) {
                    clears.pop();
                }
            }
        };

        GuiBuffers.prototype.updateGuiBuffer = function() {

            var releasedIndices = this.getBookState(ENUMS.IndexState.INDEX_RELEASING);
            this.updateReleaseIndices(releasedIndices);
            var cleanupIndices = this.getBookState(ENUMS.IndexState.INDEX_FRAME_CLEANUP);
            this.updateCleanupIndices(cleanupIndices);
            this.updateActiveCount();

        };

        GuiBuffers.prototype.setElementReleased = function(guiElement) {
            guiElement.endLifecycleNow(this.getSystemTime());
            this.setIndexBookState(guiElement.index, ENUMS.IndexState.INDEX_RELEASING);
        };


        var currentDrawRange;

        GuiBuffers.prototype.bufferRangeOk = function() {
            buffer = this.buffers['offset'];
            currentDrawRange = buffer[buffer.length-3];

            if (Math.floor(currentDrawRange) !== currentDrawRange) {
                console.log("Buffer not int!", currentDrawRange,  buffer);
                return
            }

            if (this.highestRenderingIndex > (buffer.length-3) / 3) {
                console.log("Buffer out of draw range...")
                return
            }
            return true
        };


        GuiBuffers.prototype.updateDrawRange = function() {

            buffer = this.buffers['offset'];
            buffer[buffer.length-3] = this.highestRenderingIndex+1;

        };


        GuiBuffers.prototype.drawFromAvailableIndex = function() {

            if (this.getBookState(ENUMS.IndexState.INDEX_AVAILABLE).length) {
                return this.getBookState(ENUMS.IndexState.INDEX_AVAILABLE).shift();
            }

            return this.highestRenderingIndex+1;
        };

        var availableIndex;

        GuiBuffers.prototype.getAvailableIndex = function() {

            availableIndex = this.drawFromAvailableIndex();

        //    console.log(availableIndex)

            if (availableIndex > this.highestRenderingIndex) {

                if (!this.bufferRangeOk()) {
                    return false;
                }

                this.highestRenderingIndex = availableIndex;
                this.updateDrawRange();
            }

            return availableIndex;
        };

        GuiBuffers.prototype.setIndexBookState = function(index, state) {
            this.elementBook[state].push(index);
        };

        GuiBuffers.prototype.getBookState = function(state) {
            return this.elementBook[state];
        };

        GuiBuffers.prototype.registerElement = function(guiElement) {
            this.activeCount++;
            this.activeElements[guiElement.index] = guiElement;
        };

        return GuiBuffers;

    });