"use strict";

define([
    'evt',
    '3d/SimpleSpatial',
    'PipelineAPI'

], function(
    evt,
    SimpleSpatial,
    PipelineAPI
) {

    var i;
    var spatials = [];
    var msg;

    var camPos;
    var camQuat;
    var inverseQuat = new THREE.Quaternion();

    var calcPos = new THREE.Vector3();
    var calcQuat = new THREE.Quaternion();
    var calcObj = new THREE.Object3D();

    var addSimpleSpatial = function(ss) {
        spatials.push(ss);
    };

    var DynamicMain = function() {

        var standardGeo = function(e) {
            msg = evt.args(e).msg;
            console.log("Handle DYNAMIC_MODEL, STANDARD_GEOMETRY", msg);
            var simpSpat = new SimpleSpatial(msg[0], msg[1], msg[3], msg[4]);


            var modelReady = function(sSpat, boneConf) {
                console.log("SimpleSpatial ready: ", boneConf, sSpat);
                PipelineAPI.setCategoryKeyValue('DYNAMIC_BONES', sSpat.modelId, boneConf);
                ThreeAPI.addToScene(sSpat.obj3d);
                //       ThreeAPI.attachObjectToCamera(sSpat.obj3d);
                sSpat.dynamicSpatial.setupMechanicalShape(msg[2]);
                WorkerAPI.registerMainDynamicSpatial(sSpat.getDynamicSpatial());
            };

            ThreeAPI.loadMeshModel(simpSpat.modelId, simpSpat.obj3d);
            simpSpat.setReady(modelReady);
            addSimpleSpatial(simpSpat)

        };
    };

    var pos;
    var quat;
    var obj3d;

    DynamicMain.prototype.tickDynamicMain = function() {

        for (i = 0; i < spatials.length; i++) {

            spatials[i].updateSimpleSpatial();

            obj3d = spatials[i].obj3d;
            pos = spatials[i].pos;
            quat = spatials[i].quat;

            obj3d.position.copy(pos);
            obj3d.quaternion.copy(quat)

        }
    };

    return DynamicMain;

});