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
            "diffusors"      : { "dimensions":4, "dynamic":false},
            "vertexColor"    : { "dimensions":4, "dynamic":false},
            "scale3d"        : { "dimensions":3, "dynamic":false},
            "orientation"    : { "dimensions":4, "dynamic":false}
        };

        var useBuffers = [
            "offset",
            "scale3d",
            "vertexColor",
            "tileindex",
            "orientation"
        ];

        var GuiBuffers = function(uiSysKey, assetId, elementCount) {
            this.uiSysKey = uiSysKey;
            this.assetId = assetId;
            this.buffers = {};
            this.dormantElements = [];
            this.activeElements = [];
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
            buffer[idx+3] = z;
            buffer[idx+4] = w;
            this.setUpdated(buffer);
        };



        GuiBuffers.prototype.setUpdated = function(buffer) {
            buffer[buffer.length-1] = 1
        };

        GuiBuffers.prototype.recoverElement = function(guiElement) {

            this.dormantElements.push(guiElement);

        };

        GuiBuffers.prototype.registerElement = function(guiElement) {

            this.activeElements.push(guiElement);
            buffer = this.buffers['offset'];
            buffer[buffer.length-3] = this.activeElements.length;
            return this.activeElements.length-1;

        };

        return GuiBuffers;

    });