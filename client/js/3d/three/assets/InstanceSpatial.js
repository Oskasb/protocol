"use strict";

define([

    ],
    function(

    ) {

    var tempVec1 = new THREE.Vector3();

        var InstanceSpatial = function(obj3d) {
            this.obj3d = obj3d;
            this.offsetObj3d = new THREE.Object3D();
            this.frameMovement = new THREE.Vector3();
            this.attachedToBone = null;
            this.parentSpatial = null;
        };

        InstanceSpatial.prototype.getFrameMovement = function() {
            return this.frameMovement;
        };

        InstanceSpatial.prototype.getSpatialPosition = function() {
            return this.obj3d.position;
        };

        InstanceSpatial.prototype.setPosXYZ = function(x, y, z) {
            this.frameMovement.copy(this.obj3d.position);
            this.obj3d.position.x = x;
            this.obj3d.position.y = y;
            this.obj3d.position.z = z;
            this.frameMovement.sub(this.obj3d.position);
            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
            }
        };

        InstanceSpatial.prototype.setQuatXYZW = function(x, y, z, w) {
            this.obj3d.quaternion.x = x;
            this.obj3d.quaternion.y = y;
            this.obj3d.quaternion.z = z;
            this.obj3d.quaternion.w = w;
            if (this.geometryInstance) {
                this.geometryInstance.applyObjQuat();
            }
        };

        InstanceSpatial.prototype.setScaleXYZ = function(x, y, z) {
            this.obj3d.scale.x = x;
            this.obj3d.scale.y = y;
            this.obj3d.scale.z = z;
            if (this.geometryInstance) {
                this.geometryInstance.applyObjScale();
            }
        };

        InstanceSpatial.prototype.getOffsetObj3D = function() {
            return this.offsetObj3d;
        };

        InstanceSpatial.prototype.attachToBone = function(bone, parentSpatial) {
            this.attachedToBone = bone;
            this.parentSpatial = parentSpatial;
        };


        InstanceSpatial.prototype.stickToBoneWorldMatrix = function(bone) {

            bone.matrixWorld.decompose(this.obj3d.position, this.obj3d.quaternion, this.obj3d.scale);

            if (this.offsetObj3d.position.lengthSq()) {
                tempVec1.copy(this.offsetObj3d.position);
                tempVec1.applyQuaternion(this.obj3d.quaternion);
                this.obj3d.position.add(tempVec1);
            }

            tempVec1.setFromMatrixScale(bone.matrixWorld);
            this.obj3d.scale.divide(tempVec1);
            this.obj3d.scale.multiply(this.offsetObj3d.scale);
            this.obj3d.quaternion.multiply(this.offsetObj3d.quaternion);

            if (this.geometryInstance) {
                this.geometryInstance.applyObjPos();
                this.geometryInstance.applyObjQuat();
                this.geometryInstance.applyObjScale();
            }

        };


        InstanceSpatial.prototype.updateSpatialFrame = function() {

            if (this.attachedToBone) {
                this.stickToBoneWorldMatrix(this.attachedToBone)
            };

        };

        InstanceSpatial.prototype.updateSpatialMatrix = function() {

            if (!this.geometryInstance) {
                this.obj3d.updateMatrixWorld();
            }

        };


        InstanceSpatial.prototype.setGeometryInstance = function(geomIns) {
            this.geometryInstance = geomIns;
        };

        return InstanceSpatial;

    });


