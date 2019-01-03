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

        var attributes = [
        //    {"name":"startTime",   "dimensions":1, "dynamic":true},
        //    {"name":"duration",    "dimensions":1, "dynamic":false},
            {"name":"offset",       "dimensions":3, "dynamic":false},
        //    {"name":"texelRowSelect", "dimensions":4, "dynamic":false},
        //    {"name":"tileindex",   "dimensions":2},
        //    {"name":"diffusors",   "dimensions":4, "dynamic":false},
            {"name":"vertexColor", "dimensions":4, "dynamic":false},
            {"name":"scale3d",     "dimensions":3, "dynamic":false},
            {"name":"orientation", "dimensions":4, "dynamic":false}
        ];

        var InstanceAPI = function() {};


        InstanceAPI.registerGeometry = function(id, model, settings, material) {
            materials.push(material);
            var count = settings.instances;

            var buffers = {};
            InstanceBuffer.extractFirstMeshGeometry(model.scene.children[0], buffers);
            var insBufs = new InstanceBuffer(buffers.verts, buffers.uvs, buffers.indices, buffers.normals);

            for (var i = 0; i < attributes.length; i++) {
                var attrib = attributes[i];
                insBufs.attachAttribute(attrib.name, attrib.dimensions, count, attrib.dynamic);
            }

            insBufs.setMaterial(material);
            instanceBuffers[id] = insBufs;
            instanceBuffers[id].setInstancedCount(0);
            insBufs.addToScene();

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

        InstanceAPI.updateInstances = function(tpf) {

            for (var key in instances) {
                for (var i = 0; i < instances[key].length; i++) {
                //    instances[key][i].obj3d.position.x += (Math.random()-0.5)*0.2
                //    instances[key][i].obj3d.position.z += (Math.random()-0.5)*0.2
                //    instances[key][i].obj3d.rotateY(0.05);
                //    instances[key][i].setVertexColor(0.7+Math.random() * 0.5,0.7+Math.random() * 0.5,0.8+Math.random() * 0.5,0.8+Math.random() * 0.5)

                //    instances[key][i].applyObj3d();
                //    instances[key][i].setAttribXYZ('offset', Math.random()* 10, 0, Math.random()*40)
                //    instances[key][i].setAttribXYZ('orientation', 0, 0, 0, 1)
                }

            }

            var mat;
            for (var i = 0; i < materials.length; i++) {
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

