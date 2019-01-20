"use strict";

define([
        '3d/three/assets/InstanceAnimator',
        'evt'
    ],
    function(
        InstanceAnimator,
        evt
    ) {

        var InstancedModel = function(originalAsset) {
            this.originalAsset = originalAsset;
            this.originalModel = originalAsset.model;

            var onUpdateEvent = function(event) {
                this.handleUpdateEvent(event)
            }.bind(this);

            this.callbacks = {
                onUpdateEvent :onUpdateEvent
            };

            this.active = ENUMS.InstanceState.INITIATING;

            this.attachments = [];
        };

        InstancedModel.prototype.getAssetId = function() {
            return this.originalAsset.id;
        };

        InstancedModel.prototype.setPointer = function(ptr) {
            this.clearEventListener();
            this.ptr = ptr;
            this.setupEventListener();
        };

        InstancedModel.prototype.getPointer = function() {
            return this.ptr;
        };

        InstancedModel.prototype.getSpatial = function() {
            return this.spatial;
        };

        InstancedModel.prototype.handleUpdateEvent = function(event) {
            evt.parser.parseEntityEvent(this, event);
        };

        InstancedModel.prototype.requestAttachment = function(ptr) {

            var attachInstance = WorkerAPI.getDynamicMain().getInstanceByPointer(ptr);

            this.attachInstancedModel(attachInstance);

        };

        InstancedModel.prototype.setupEventListener = function() {
            evt.on(this.ptr, this.callbacks.onUpdateEvent)
        };

        InstancedModel.prototype.clearEventListener = function() {
            evt.removeListener(this.ptr, this.callbacks.onUpdateEvent)
        };

        InstancedModel.prototype.initModelInstance = function(callback) {

            var cloned = function(spatial) {
                this.spatial = spatial;
                this.obj3d = spatial.obj3d;
                this.applyModelMaterial(this.obj3d , this.originalModel.getModelMaterial());


                if (this.originalModel.hasAnimations) {
                    if (this.obj3d.animator) {
                        this.animator = this.obj3d.animator
                    } else {
                        this.animator = new InstanceAnimator(this);
                        this.obj3d.animator = this.animator;
                    }
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

        InstancedModel.prototype.setActive = function(ENUM) {
            this.active = ENUM;
            if (this.active !== ENUMS.InstanceState.DECOMISSION ) {
                this.activateInstancedModel();

                this.decomissioned = false;

            } else {
                if (this.decomissioned) {
                    console.log("Already decomissioned", this);
                    return;
                }
                this.decomissioned = true;
                this.decommissionInstancedModel();
            }

        };

        InstancedModel.prototype.getObj3d = function() {
            return this.obj3d;
        };

        InstancedModel.prototype.attachInstancedModel = function(instancedModel) {

            var getBoneByName = function(bones, name) {
                for (var i = 0; i < bones.length; i++) {
                    if (bones[i].name === name) {
                        return bones[i];
                    }
                }
                console.log("No bone by name:", name);
            };

            var replaceChildBones = function(parent, child) {
                var parentSkel = parent.skeleton;
                var childSkel = child.skeleton;

                for (var i = 0; i < childSkel.bones.length; i++) {
                    var boneName = childSkel.bones[i].name;
                    var useBone = getBoneByName(parentSkel.bones, boneName);
                    childSkel.bones[i] = useBone;
                }
            };

            var _this = this;
            instancedModel.obj3d.traverse(function(node) {
                if (node.type === 'Mesh') {
                    console.log("Not SkinnedMesh", _this.skinNode);
                }
                if (node.type === 'SkinnedMesh') {

                    if (_this.skinNode) {

                        replaceChildBones(_this.skinNode, node);

                    }
                }
            });

            this.obj3d.add(instancedModel.obj3d);
            this.attachments.push(instancedModel)

        };

        InstancedModel.prototype.detatchInstancedModel = function(instancedModel) {
            this.obj3d.remove(instancedModel.obj3d);
        //    instancedModel.decommissionInstancedModel()
        };

        InstancedModel.prototype.detatchAllAttachmnets = function() {
            while (this.attachments.length) {
                this.detatchInstancedModel(this.attachments.pop())
            }
        };

        InstancedModel.prototype.getAnimationMap = function() {
            return this.originalModel.animMap;
        };


        InstancedModel.prototype.updateAnimationState = function(animationKey, weight, timeScale, fade, channel) {
            this.animator.updateAnimationAction(animationKey, weight, timeScale, fade, channel);
        };

        InstancedModel.prototype.activateInstancedModel = function() {
            this.isDecomiisisoned = false;
            ThreeAPI.addToScene(this.obj3d);
            if (this.animator) {
                this.animator.activateAnimator();
            }
        };

        InstancedModel.prototype.decommissionInstancedModel = function() {

            WorkerAPI.getDynamicMain().removeFromIsntanceIndex(this);

            if (this.isDecomiisisoned) {
                console.log("Already Decomissioned");
            }
            this.isDecomiisisoned = true;


            this.clearEventListener();
            if (this.animator) {
                this.animator.deActivateAnimator();
            }
            this.originalModel.recoverModelClone(this.getSpatial());
            this.originalAsset.disableAssetInstance(this);
        };

        return InstancedModel;

    });