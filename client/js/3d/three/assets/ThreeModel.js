"use strict";

define([

    ],
    function(

    ) {

        var ThreeModel = function(id, config, callback) {

            this.config = config;

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

            var modelFileLoaded = function(src, asset) {
            //    console.log(src, asset);
                this.model = asset;
                ThreeAPI.loadThreeAsset('MODEL_SETTINGS_', config.settings, modelSettingsLoaded);
            }.bind(this);

            ThreeAPI.loadThreeAsset('FILES_GLB_', config.model, modelFileLoaded);

        };

        ThreeModel.prototype.applyModelMaterial = function(material) {

            this.getModelRoot().traverse(function(node) {
                if (node.type === 'Mesh') {
                    node.material = material;
                }
            })
        };

        ThreeModel.prototype.getModelRoot = function() {
            return this.model.scene;
        };

        ThreeModel.prototype.getModelMaterial = function() {
            return this.material.getAssetMaterial();
        };

        ThreeModel.prototype.getModelClone = function(callback) {

            callback(this.getModelRoot().clone())

        };

        return ThreeModel;

    });