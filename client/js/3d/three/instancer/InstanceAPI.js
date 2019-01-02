"use strict";


define([
        '3d/three/instancer/InstanceBuffer',
        '3d/three/instancer/InstancingMaterial'
    ],
    function(
        InstanceBuffer,
        InstancingMaterial
    ) {

        var instanceBuffers = {};

        var attributes = [
            {"name":"startTime",   "dimensions":1, "dynamic":true},
            {"name":"duration",    "dimensions":1, "dynamic":false},
            {"name":"offsetSize",  "dimensions":4, "dynamic":false},
            {"name":"texelRowSelect", "dimensions":4, "dynamic":false},
            {"name":"tileindex",   "dimensions":2},
            {"name":"diffusors",   "dimensions":4, "dynamic":false},
            {"name":"scale3d",     "dimensions":4, "dynamic":false},
            {"name":"orientation", "dimensions":4, "dynamic":false}
        ];

        var InstanceAPI = function() {};


        InstanceAPI.registerGeometry = function(id, model, settings, material) {

            var count = settings.instances;
            var buffers = InstanceBuffer.extractFirstMeshGeometry(model.children[0]);
            var insBufs = new InstanceBuffer(buffers.verts, buffers.uvs, buffers.indices, buffers.normals);

            for (var i = 0; i < attributes.length; i++) {
                var attrib = attributes[i]
                insBufs.addAttribute(attrib.name, attrib.dimensions, count, attrib.dynamic);
            }

            instanceBuffers[id] = insBufs;

            var conf = {
                "id":"gpu_main_atlas_spatial_material",
                "shader":"INSTANCING_GPU_GEOMETRY",

                "particle_texture":"atlas_2k_diff",
                "data_texture":"data_texture",

                "global_uniforms":{
                    "fogDensity": { "value": 0.00025 },
                    "fogColor": { "value": {"r":1, "g":1, "b":1}},
                    "ambientLightColor": { "value": {"r":1, "g":1, "b":1}},
                    "sunLightColor": { "value": {"r":1, "g":1, "b":1}},
                    "sunLightDirection": { "value": {"x":1, "y":1, "z":1}}
                },

                "settings":{
                    "tiles_x":1,
                    "tiles_y":1,
                    "flip_y":false,
                    "data_rows":128
                }
            }

        };

        InstanceAPI.request = function(workerKey, callback) {

        };

        InstanceAPI.buildMessage = function(protocolKey, data) {

        };

        InstanceAPI.callWorker = function(workerKey, msg, transfer) {

        };


        return InstanceAPI;
    });

