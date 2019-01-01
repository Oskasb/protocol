"use strict";

define([
    'PipelineAPI'
    ],
    function(
        PipelineAPI
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

            model.applyModelMaterial(model.getModelMaterial());

            this.model = model;
            cb(this);
        };

        ThreeAsset.prototype.instantiateAsset = function(assetInstanceCallback) {
            this.model.getModelClone(assetInstanceCallback)
        };

        return ThreeAsset;

    });