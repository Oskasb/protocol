"use strict";


define([
        '3d/three/instancer/InstanceBuffer',
        '3d/three/instancer/GeometryInstance'
    ],
    function(
        InstanceBuffer,
        GeometryInstance
    ) {

        var instanceBuffers = {};

        var instances = {};
        var materials = [];

        var uiSystems = {};

        var attributes = {
            "startTime"      : { "dimensions":1, "dynamic":true },
            "duration"       : { "dimensions":1, "dynamic":false},
            "offset"         : { "dimensions":3, "dynamic":false},
            "texelRowSelect" : { "dimensions":4, "dynamic":false},
            "tileindex"      : { "dimensions":2                 },
            "diffusors"      : { "dimensions":4, "dynamic":false},
            "vertexColor"    : { "dimensions":4, "dynamic":false},
            "scale3d"        : { "dimensions":3, "dynamic":false},
            "orientation"    : { "dimensions":4, "dynamic":false}
        };

        var InstanceAPI = function() {};


        InstanceAPI.registerGeometry = function(id, model, settings, material) {

            if (materials.indexOf(material) === -1) {
                materials.push(material);
            }

            var count = settings.instances;
            var attribs = settings.attributes;

            var buffers = {};
            InstanceBuffer.extractFirstMeshGeometry(model.scene.children[0], buffers);
            var insBufs = new InstanceBuffer(buffers.verts, buffers.uvs, buffers.indices, buffers.normals);

            for (var i = 0; i < attribs.length; i++) {
                var attrib = attributes[attribs[i]];
                var buffer = insBufs.buildBuffer(attrib.dimensions, count);
                insBufs.attachAttribute(buffer, attribs[i], attrib.dimensions, attrib.dynamic);
            }

            insBufs.setMaterial(material);
            instanceBuffers[id] = insBufs;
            instanceBuffers[id].setInstancedCount(0);
            insBufs.addToScene(settings.cameraspace);
            return insBufs;
        };

        InstanceAPI.instantiateGeometry = function(id, callback) {
            if (!instances[id]) {
                instances[id] = []
            }
            var idx = instances[id].length;
            instanceBuffers[id].setInstancedCount(idx+1);
            var instance = new GeometryInstance(id, idx, instanceBuffers[id]);
            instances[id].push(instance);
            callback(instance);
        };

        InstanceAPI.setupUiInstancing = function(msg) {
            console.log("setupUiInstancing", msg);
            var uiSysId = msg[0];
            var assetId = msg[1];
            var bufferNames = msg[2];
            var buffers     = msg[3];

            if (!uiSystems[uiSysId]) {
                uiSystems[uiSysId] = [];
            }

            var assetLoaded = function(src, asset) {
                console.log("Ui Asset Loaded", asset);
                var instanceBuffers = asset.instanceBuffers;
                for (var i = 0; i < bufferNames.length; i++) {
                    var attrib = attributes[bufferNames[i]];
                    instanceBuffers.attachAttribute(buffers[i], bufferNames[i], attrib.dimensions, attrib.dynamic)
                }
                uiSystems[uiSysId].push(instanceBuffers);
            }

            ThreeAPI.loadThreeAsset('MODELS_', assetId, assetLoaded);

        };

        var updateUiSystemBuffers = function(instanceBuffers) {

            instanceBuffers.setInstancedCount(instanceBuffers.updateBufferStates());
        };

        var color;
        var applyUniformEnvironmentColor = function(uniform, worldProperty) {
            color = ThreeAPI.readEnvironmentUniform(worldProperty, 'color');
            uniform.value.r = color.r;
            uniform.value.g = color.g;
            uniform.value.b = color.b;
        };

        var quat;
        var tempVec = new THREE.Vector3();
        var applyUniformEnvironmentQuaternion = function(uniform, worldProperty) {
            quat = ThreeAPI.readEnvironmentUniform(worldProperty, 'quaternion');
            tempVec.set(0, 0, -1);
            tempVec.applyQuaternion(quat);
            uniform.value.x = tempVec.x;
            uniform.value.y = tempVec.y;
            uniform.value.z = tempVec.z;
        };

        var i;

        InstanceAPI.updateInstances = function(tpf) {

            for (var key in uiSystems) {
                for (i = 0; i < uiSystems[key].length; i++) {
                    updateUiSystemBuffers(uiSystems[key][i])
                }
            }

            var mat;
            for (i = 0; i < materials.length; i++) {
                mat = materials[i];

                if (mat.uniforms.systemTime) {
                    mat.uniforms.systemTime.value += tpf;
                } else {
                    console.log("no uniform yet...")
                }

                if (mat.uniforms.fogColor) {
                    applyUniformEnvironmentColor(mat.uniforms.fogColor, 'fog')
                }

                if (mat.uniforms.fogDensity) {
                    mat.uniforms.fogDensity.value = ThreeAPI.readEnvironmentUniform('fog', 'density');
                }

                if (mat.uniforms.ambientLightColor) {
                    applyUniformEnvironmentColor(mat.uniforms.ambientLightColor, 'ambient');
                }

                if (mat.uniforms.sunLightColor) {
                    applyUniformEnvironmentColor(mat.uniforms.sunLightColor, 'sun');
                }

                if (mat.uniforms.sunLightDirection) {
                    applyUniformEnvironmentQuaternion(mat.uniforms.sunLightDirection, 'sun');
                }
                mat.needsUpdate = true;
            }

        };


        return InstanceAPI;
    });

