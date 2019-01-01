"use strict";

define([
        '3d/three/assets/InstanceAnimator'
    ],
    function(InstanceAnimator) {

        var InstancedModel = function(originalModel) {
            this.originalModel = originalModel;

            this.obj3d;
        };

        InstancedModel.prototype.initModelInstance = function(callback) {

            var cloned = function(clone) {
                this.applyModelMaterial(clone, this.originalModel.getModelMaterial());
                this.obj3d = clone;

                if (this.originalModel.hasAnimations) {
                    this.animator = new InstanceAnimator(this)

                }

                callback(this)
            }.bind(this);

            this.originalModel.getModelClone(cloned)
        };

        InstancedModel.prototype.applyModelMaterial = function(clone, material) {

            var _this = this;

            clone.traverse(function(node) {
                if (node.type === 'Mesh') {
                    node.material = material;
                }
                if (node.type === 'SkinnedMesh') {
                    _this.skinNode = node;
                    node.material = material;
                    material.skinning = true;
                }
            })
        };

        InstancedModel.prototype.getObj3d = function() {
            return this.obj3d;
        };

        InstancedModel.prototype.attachInstancedModel = function(instancedModel) {

            var _this = this;
            instancedModel.obj3d.traverse(function(node) {
                if (node.type === 'Mesh') {

                }
                if (node.type === 'SkinnedMesh') {

                    if (_this.skinNode) {

                        node.bind(_this.skinNode.skeleton, _this.skinNode.matrixWorld)
                    //    _this.skinNode.parent.add(node)
                        console.log("Bind Skel", _this.skinNode, node);

                    }

                }
            })

            this.obj3d.add(instancedModel.obj3d);

        };

        InstancedModel.prototype.getAnimationMap = function() {
            return this.originalModel.animMap;
        };

        InstancedModel.prototype.playAnimation = function(animationKey, timeScale, weight) {
            this.animator.playAnimationAction(animationKey, timeScale, weight);
        };

        return InstancedModel;

    });