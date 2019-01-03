"use strict";


define([],
    function() {

    var tempVec1 = new THREE.Vector3();
        var tempQuat = new THREE.Quaternion();

        var GeometryInstance = function(id, index, insBuffers) {
            this.id = id;
            this.index = index;
            this.instancingBuffers = insBuffers;
            this.baseScale = 10;
            this.baseQuat = new THREE.Quaternion();
            this.obj3d = new THREE.Object3D();
            this.color = new THREE.Color();
            this.alpha = 1;
            this.initBuffers()
        };
//

        GeometryInstance.prototype.setAttribXYZ = function(name, x, y, z) {
            this.instancingBuffers.setAttribXYZ(name, this.index, x, y, z)
        };

        GeometryInstance.prototype.setAttribXYZW = function(name, x, y, z, w) {
            this.instancingBuffers.setAttribXYZW(name, this.index, x, y, z, w)
        };

        GeometryInstance.prototype.setVertexColor = function(r, g, b, a) {
            this.alpha = a;
            this.color.r = r;
            this.color.g = g;
            this.color.b = b;
            this.instancingBuffers.setBufferVec4("vertexColor", this.index, r, g, b, a)
        };

        GeometryInstance.prototype.setPosition = function(position) {
            this.instancingBuffers.setBufferVec3("offset", this.index, position)
        };

        GeometryInstance.prototype.setQuaternion = function(quaternion) {
            tempQuat.copy(quaternion);
            tempQuat.multiply(this.baseQuat);
            this.instancingBuffers.setBufferVec4("orientation", this.index, tempQuat)
        };

        GeometryInstance.prototype.setScale = function(scale) {
            this.obj3d.scale.copy(scale);
            tempVec1.x = this.baseScale * this.obj3d.scale.x;
            tempVec1.y = this.baseScale * this.obj3d.scale.y;
            tempVec1.z = this.baseScale * this.obj3d.scale.z;
            this.instancingBuffers.setBufferVec3("scale3d", this.index, tempVec1)
        };

        GeometryInstance.prototype.applyObj3d = function() {
            this.setPosition(this.obj3d.position)
            this.setQuaternion(this.obj3d.quaternion)
            this.setScale(this.obj3d.scale)
        };


        GeometryInstance.prototype.initBuffers = function() {
            this.obj3d.position.x = Math.random() * -40;
            this.obj3d.position.z = Math.random() * -40;
        //    this.obj3d.rotateX(-Math.PI*0.25);
            this.setVertexColor(0.5+Math.random() * 0.5,0.5+Math.random() * 0.5,0.5+Math.random() * 0.2,0.5+Math.random() * 0.5)

            this.baseQuat.copy(this.obj3d.quaternion);
            this.setVertexColor(1, 1, 1, 1);
            this.applyObj3d()
        };


        GeometryInstance.prototype.showHide = function(bool) {

        };


        return GeometryInstance;
    });

