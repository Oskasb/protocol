"use strict";

define([

    ],
    function(

    ) {

        var ThreeModel = function(id, config, callback) {

            this.config = config;

            this.animMap = {};
            this.animations = {};

            this.hasAnimations = false;

            var materialLoaded = function(src, asset) {
            //    console.log(src, asset);
                this.material = asset;
                callback(this);
            }.bind(this);

            var modelSettingsLoaded = function(src, asset) {
             //   console.log(src, asset);
                this.settings = asset;
                ThreeAPI.loadThreeAsset('MATERIALS_', config.material, materialLoaded);
            }.bind(this);

            var modelFilesLoaded = function(src, asset) {
                 ThreeAPI.loadThreeAsset('MODEL_SETTINGS_', config.settings, modelSettingsLoaded);
            }.bind(this);

            this.loadModelFiles(config, modelFilesLoaded)

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
                    rqs++;
                    ThreeAPI.loadThreeAsset('FILES_GLB_', id, animLoaded);
                }
            }

            ThreeAPI.loadThreeAsset('FILES_GLB_', config.model, fileLoaded);
            rqs++;
            loadCheck();

        };

        ThreeModel.prototype.getModelRoot = function() {
            return this.model.scene;
        };

        ThreeModel.prototype.getModelMaterial = function() {
            return this.material.getAssetMaterial();
        };

        ThreeModel.prototype.getModelClone = function(callback) {

            if (this.hasAnimations) {
                callback(this.model.cloneSkinnedModelOriginal())
            } else {
                callback(this.model.cloneMeshModelOriginal())
            }

        };

        return ThreeModel;

    });