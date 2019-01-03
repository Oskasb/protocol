"use strict";

define([

    ],
    function(

    ) {

    var baseObj3d = new THREE.Object3D();

    var pos = baseObj3d.position;
    var scale = baseObj3d.scale;
    var quat = baseObj3d.quaternion;
    var rgba = {r:1, g:1, b:1, a:1};

        var GuiBufferElement = function(guiBuffers) {
            this.guiBuffers = guiBuffers;
            this.index = this.guiBuffers.registerElement(this);
            this.setDefaultBuffers()
        };


        GuiBufferElement.prototype.setAttribX = function(name, index, x) {

        };

        GuiBufferElement.prototype.setAttribXY = function(name, index, x, y) {

        };

        GuiBufferElement.prototype.setPositionVec3 = function(vec3) {
            this.guiBuffers.setAttribXYZ('offset', this.index, vec3.x, vec3.y, vec3.z)
        };

        GuiBufferElement.prototype.setScaleVec3 = function(vec3) {
            this.guiBuffers.setAttribXYZ('scale3d', this.index, vec3.x, vec3.y, vec3.z)
        };

        GuiBufferElement.prototype.setQuat = function(q) {
            this.guiBuffers.setAttribXYZW('orientation', this.index, q.x, q.y, q.z, q.w)
        };

        GuiBufferElement.prototype.setColorRGBA = function(color) {
            this.guiBuffers.setAttribXYZW('vertexColor', this.index, color.r, color.g, color.b, color.a)
        };

        GuiBufferElement.prototype.setAttribXY = function(name, index, x, y) {

        };

        GuiBufferElement.prototype.setDefaultBuffers = function() {
            this.setPositionVec3(pos);
            this.setScaleVec3(scale);
            this.setQuat(quat);
            this.setColorRGBA(rgba)
        };

        GuiBufferElement.prototype.deactivateElement = function() {
            this.guiBuffers.recoverElement(this);
        };

        return GuiBufferElement;

    });