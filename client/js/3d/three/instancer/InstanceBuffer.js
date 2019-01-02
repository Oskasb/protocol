"use strict";

define([

    ],
    function(

    ) {

        var InstanceBuffer = function(verts, uvs, indices, normals) {
            this.buildGeometry(verts, uvs, indices, normals);
            this.attributes = {};
        };

        InstanceBuffer.prototype.buildGeometry = function(verts, uvarray, indices, normals) {

            var geometry = new THREE.InstancedBufferGeometry();

            var posBuffer   =     verts;
            var uvBuffer    =     uvarray;

            // per mesh data

            if (indices) {
                posBuffer   =      new Float32Array( verts );
                uvBuffer    =      new Float32Array( uvarray );
            } else {
                indices = [];
                for ( var i = 0; i < verts.length / 3; i ++ ) {
                    indices[ i ] = i;
                }
            }

            if (normals) {
                var normal = new THREE.BufferAttribute(normals , 3 );
                geometry.addAttribute( 'vertexNormal', normal );
            }


            var indexBuffer =   new Uint16Array( indices );
            geometry.setIndex( new THREE.BufferAttribute( indexBuffer , 1 ) );

            geometry.index.needsUpdate = true;

            var vertices = new THREE.BufferAttribute(posBuffer , 3 );
            geometry.addAttribute( 'vertexPosition', vertices );

            var uvs = new THREE.BufferAttribute( uvBuffer , 2 );
            geometry.addAttribute( 'uv', uvs );


            this.geometry = geometry;

            var mesh = new THREE.Mesh(geometry);
            mesh.matrixAutoUpdate = false;
            mesh.frustumCulled = false;
            //    mesh.scale.set(1, 1, 1);
            this.applyMesh(mesh);

        };


        InstanceBuffer.prototype.addAttribute = function(name, dimensions, count, dynamic) {
            var buffer = new Float32Array(count * dimensions);
            var attribute = new THREE.InstancedBufferAttribute(buffer, dimensions, 1).setDynamic( dynamic );
            this.geometry.addAttribute(name, attribute);
        };

        InstanceBuffer.prototype.applyMesh = function(mesh) {
            this.mesh = mesh;
        };

        InstanceBuffer.prototype.setInstancedCount = function(count) {
            this.mesh.geometry.maxInstancedCount = count;
        };

        InstanceBuffer.prototype.dispose = function() {
            ThreeAPI.hideModel(this.mesh);
            this.geometry.dispose();
        };



        InstanceBuffer.prototype.removeFromScene = function() {
            ThreeAPI.hideModel(this.mesh);
        };

        InstanceBuffer.prototype.addToScene = function(screenSpace) {
            if (screenSpace) {
                ThreeAPI.attachObjectToCamera(this.mesh);
            } else {
                ThreeAPI.showModel(this.mesh);
            }
        };


        InstanceBuffer.extractFirstMeshGeometry = function(child) {

            var geometry;

            child.traverse(function(node) {
                if (node.type === 'Mesh') {
                    geometry = node.geometry;
                    var verts   = geometry.attributes.position.array;
                    var normals = geometry.attributes.normal.array;
                    var uvs     = geometry.attributes.uv.array;
                    var index   = geometry.index.array;
                    return {verts:verts, indices:index, normals:normals, uvs:uvs}
                }
            });

            console.log("No geometry found for:", child)

        };

        return InstanceBuffer;

    });