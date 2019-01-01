"use strict";

define([
        '3d/three/assets/InstancedModel'
    ],
    function(
        InstancedModel
    ) {

    var datakey = 'MODELS_';

        var ThreeAsset = function(assetId, assetReadyCallback) {
            this.model;
            this.initAssetConfigs(assetId, assetReadyCallback);
        };

        ThreeAsset.prototype.initAssetConfigs = function(assetId, cb) {

            var assetLoaded = function(src, asset) {
            //   PipelineAPI.removeCategoryKeySubscriber('ASSET', datakey+assetId, cb)
                this.finaliseAsset(asset, cb)
            }.bind(this);

            ThreeAPI.loadThreeAsset(datakey, assetId, assetLoaded);

        };

        ThreeAsset.prototype.finaliseAsset = function(model, cb) {

            this.model = model;
            cb(this);
        };

        ThreeAsset.prototype.instantiateAsset = function(assetInstanceCallback) {

            var modelInstance = new InstancedModel(this.model);

            modelInstance.initModelInstance(assetInstanceCallback);


        };

        return ThreeAsset;

    });