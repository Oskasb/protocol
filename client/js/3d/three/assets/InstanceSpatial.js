"use strict";

define([

    ],
    function(

    ) {

        var InstanceSpatial = function(obj3d) {
            this.obj3d = obj3d;
        };

        InstanceSpatial.prototype.setPosXYZ = function(x, y, z) {
            this.obj3d.position.x = x;
            this.obj3d.position.y = y;
            this.obj3d.position.z = z;
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

        InstanceSpatial.prototype.setGeometryInstance = function(geomIns) {
            this.geometryInstance = geomIns;
        };

        return InstanceSpatial;

    });


