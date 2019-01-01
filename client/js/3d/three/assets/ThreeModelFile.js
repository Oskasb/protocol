"use strict";

define([

    ],
    function(

    ) {

        var ThreeModelFile = function(id, config, callback) {

        //    console.log("ThreeModelFile", id, config);

            var modelLoaded = function(glb) {
                console.log("glb loaded", glb);
                this.scene = glb;
                callback(this);
            }.bind(this);

            loadGLB(config.url, modelLoaded)
        };



        var loadGLB = function(url, cacheMesh) {

            // Makes a Scene

            var obj;
            var animations = [];

            var err = function(e, x) {
                console.log("glb ERROR:", e, x);
            };

            var prog = function(p, x) {
            //    console.log("glb PROGRESS:", p, x);
            };

            var loaded = function ( model ) {
            //    console.log("glb LOADED: ",model);
                model.animations = animations;
                obj = model.scene;
                obj.animations = animations;
                cacheMesh(obj);
            };

            var loadModel = function(src) {
                var loader = new THREE.GLTFLoader();
                loader.load(src, loaded, prog, err);
            };

            loadModel(url+'.glb')

        };

        var cloneGltf = function(mesh, clone) {

            if (mesh.animations.length) {
                clone.animations = mesh.animations;

                var skinnedMeshes = {};

                mesh.traverse(function(node) {
                    if (node.isSkinnedMesh) {
                        skinnedMeshes[node.name] = node;
                    }
                });

                var cloneBones = {};
                var cloneSkinnedMeshes = {};

                clone.traverse(function(node) {
                    if (node.isBone) {
                        cloneBones[node.name] = node;
                    }

                    if (node.isSkinnedMesh) {
                        cloneSkinnedMeshes[node.name] = node;
                    }

                });

                for (var name in skinnedMeshes) {
                    var skinnedMesh = skinnedMeshes[name];
                    var skeleton = skinnedMesh.skeleton;
                    var cloneSkinnedMesh = cloneSkinnedMeshes[name];

                    var orderedCloneBones = [];

                    for (var i = 0; i < skeleton.bones.length; ++i) {
                        var cloneBone = cloneBones[skeleton.bones[i].name];
                        orderedCloneBones.push(cloneBone);
                    }

                    cloneSkinnedMesh.bind(
                        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
                        cloneSkinnedMesh.matrixWorld);
                }

                console.log("CloneAnimated SkinMesh..", clone, mesh);
            }

            return clone
        };

        return ThreeModelFile;

    });