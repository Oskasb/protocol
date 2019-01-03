"use strict";

define([
        'application/ExpandingPool',
        '3d/three/instancer/InstanceAPI',
        '3d/three/assets/InstanceSpatial'
    ],
    function(
        ExpandingPool,
        InstanceAPI,
        InstanceSpatial
    ) {

        var ThreeModel = function(id, config, callback) {

            this.config = config;

            this.id = id;

            this.animMap = {};
            this.animations = {};
            this.animationKeys = [];

            this.hasAnimations = false;

            var materialLoaded = function(src, asset) {
            //    console.log(src, asset);
                this.material = asset;

                if (this.geometryInstancingSettings()) {
                    this.setupGeometryInstancing()
                }

                callback(this);
            }.bind(this);

            var modelSettingsLoaded = function(src, asset) {
             //   console.log(src, asset);
                this.settings = asset.settings;
                ThreeAPI.loadThreeAsset('MATERIALS_', config.material, materialLoaded);
            }.bind(this);

            var modelFilesLoaded = function(src, asset) {
                 ThreeAPI.loadThreeAsset('MODEL_SETTINGS_', config.settings, modelSettingsLoaded);
            }.bind(this);

            this.loadModelFiles(config, modelFilesLoaded)

        };

        ThreeModel.prototype.geometryInstancingSettings = function() {
        //    console.log(this.settings.instancing)
            return this.settings.instancing;
        };

        ThreeModel.prototype.setupGeometryInstancing = function() {

            var instancingSettings = this.geometryInstancingSettings();
            InstanceAPI.registerGeometry(this.id, this.model, instancingSettings, this.material.getAssetMaterial());

            var instantiateAsset = function(id, callback) {

                var instanceCb = function(geomIns) {
                    var spatial = new InstanceSpatial(geomIns.obj3d);
                    spatial.setGeometryInstance(geomIns);
                    callback(spatial);
                };

                InstanceAPI.instantiateGeometry(this.id, instanceCb);
            }.bind(this);

            this.expandingPool = new ExpandingPool(this.id, instantiateAsset);
        };

        ThreeModel.prototype.getAnimationClip = function(animationClipKey) {
            var animScene = this.animations[animationClipKey].scene;
            return animScene.animations[0]
        };

        ThreeModel.prototype.loadModelFiles = function(config, callback) {

            var rqs = 0;
            var rds = 0;

            var loadCheck = function() {
                if (rqs === rds) {
                    callback()
                }
            };

            var animLoaded = function(src, asset) {
                rds++;
                this.animations[this.animMap[asset.id]] = asset;
                loadCheck()
            }.bind(this);

            var fileLoaded = function(src, asset) {
                rds++;
                this.model = asset;
                loadCheck()
            }.bind(this);

            if (config.animations) {
                this.hasAnimations = true;
                for (var i = 0; i < config.animations.length; i++) {
                    var id = config.animations[i].id;
                    var key = config.animations[i].key;
                    this.animMap[id] = key;
                    if (typeof(ENUMS.Animations[key]) !== 'number') {
                        console.log("No animation ENUM mapped for key: ", key)
                    }
                    this.animationKeys.push(ENUMS.Animations[key]);

                    rqs++;
                    ThreeAPI.loadThreeAsset('FILES_GLB_', id, animLoaded);
                }
            }

            ThreeAPI.loadThreeAsset('FILES_GLB_', config.model, fileLoaded);
            rqs++;
            loadCheck();

        };

        ThreeModel.prototype.recoverModelClone = function(spatial) {

            if (this.geometryInstancingSettings()) {
                spatial.setPosXYZ(40, 5+this.expandingPool.poolEntryCount(), 40);
                this.expandingPool.returnToExpandingPool(spatial);
            } else {
                this.model.returnCloneToPool(spatial);
            }

        };

        ThreeModel.prototype.getModelMaterial = function() {
            return this.material.getAssetMaterial();
        };

        ThreeModel.prototype.getModelClone = function(callback) {

            if (this.geometryInstancingSettings()) {
                this.expandingPool.getFromExpandingPool(callback);
            } else {
                this.model.getCloneFromPool(callback);
            }

        };

        return ThreeModel;

    });