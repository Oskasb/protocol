"use strict";

define([

    ],
    function(

    ) {

        var GuiBufferElement = function() {

        };

        GuiBufferElement.prototype.initGuiBufferElement = function(guiBuffers) {
            this.guiBuffers = guiBuffers;
            this.index = this.guiBuffers.getAvailableIndex();
            this.guiBuffers.registerElement(this);

            this.rgba =     {r:1, g:1, b:1, a:1};
            this.pos =      {x:1, y:1, z:-1};
            this.scale =    {x:1, y:1, z:1};
            this.quat =     {x:0, y:0, z:0, w:1};
            this.sprite =   {x:7, y:0, z:0.06, w:0.06};// z for nineslice expand y, w for expand x (axis x for width 2d)

            this.lifecycle = {x:0, y:0.3, z:0, w:0.45}; // x = startTime, y = attackTime, z = endTime, w = decayTime
            this.setDefaultBuffers();

        };

        GuiBufferElement.prototype.setAttackTime = function(time) {
            this.lifecycle.y = time;
        };

        GuiBufferElement.prototype.setReleaseTime = function(time) {
            this.lifecycle.w = time;
        };

        GuiBufferElement.prototype.applyLifecycle = function() {
            this.guiBuffers.setAttribXYZW('lifecycle', this.index, this.lifecycle.x, this.lifecycle.y, this.lifecycle.z, this.lifecycle.w);
        };

        GuiBufferElement.prototype.setIndex = function(index) {
            this.index = index;
        };

        GuiBufferElement.prototype.setAttribX = function(name, index, x) {

        };

        GuiBufferElement.prototype.setTileXY = function(xy) {
            this.sprite.x = xy.x;
            this.sprite.y = xy.y;
            this.setSprite(this.sprite);
        };

        GuiBufferElement.prototype.setSprite = function(xyzw) {
            this.guiBuffers.setAttribXYZW('sprite', this.index, xyzw.x, xyzw.y, xyzw.z, xyzw.w)
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


        GuiBufferElement.prototype.startLifecycleNow = function() {
            this.lifecycle.x = this.guiBuffers.getSystemTime();
            this.lifecycle.z = 0;
            this.applyLifecycle();
        };

        GuiBufferElement.prototype.endLifecycleNow = function() {
            this.lifecycle.z = this.guiBuffers.getSystemTime();
            this.applyLifecycle();
        };

        GuiBufferElement.prototype.setDefaultBuffers = function() {
            this.setPositionVec3(this.pos);
            this.setScaleVec3(this.scale);
            this.setQuat(this.quat);
            this.setColorRGBA(this.rgba);
            this.setSprite(this.sprite);
            this.lifecycle.x = this.guiBuffers.getSystemTime();
            this.applyLifecycle();
        };

        GuiBufferElement.prototype.releaseElement = function() {
            this.guiBuffers.setElementReleased(this);
        };

        GuiBufferElement.prototype.testLifetimeIsOver = function(systemTime) {

            if ((this.lifecycle.z + this.lifecycle.w) < systemTime) {
                return true;
            }

        };


        return GuiBufferElement;

    });