"use strict";

define([
        'PipelineAPI',
        '3d/three/assets/ThreeModel',
        '3d/three/assets/ThreeMaterial',
        '3d/three/assets/ThreeTexture',
        '3d/three/assets/ThreeModelSettings',
        '3d/three/assets/ThreeModelFile',
        '3d/three/assets/ThreeMaterialSettings',
        '3d/three/assets/ThreeTextureSettings',
        '3d/three/assets/ThreeImage'
    ],
    function(
        PipelineAPI,
        ThreeModel,
        ThreeMaterial,
        ThreeTexture,
        ThreeModelSettings,
        ThreeModelFile,
        ThreeMaterialSettings,
        ThreeTextureSettings,
        ThreeImage
    ) {

        var assetMap = {
            MODELS_:            ThreeModel,
            MATERIALS_:         ThreeMaterial,
            TEXTURES_:          ThreeTexture,
            MODEL_SETTINGS_:    ThreeModelSettings,
            MATERIAL_SETTINGS_: ThreeMaterialSettings,
            TEXTURE_SETTINGS_:  ThreeTextureSettings,
            FILES_GLB_:         ThreeModelFile,
            FILES_IMAGES_:      ThreeImage
        };

        var AssetLoader = function() {

        };

        AssetLoader.prototype.initAssetConfigs = function() {

            var loadList = function(src, data) {
                this.loadAssetConfigs(data);
            }.bind(this);

            PipelineAPI.subscribeToCategoryKey('ASSETS', 'LOAD', loadList);
        };

        AssetLoader.prototype.loadAssetConfigs = function(assets) {

            var assetData = function(src, data) {

                for (var i = 0; i < data.length; i++) {
                    this.setAssetConfig(src, data[i].id, data[i]);
                }

            }.bind(this);

            for (var i = 0; i < assets.length; i++) {
                PipelineAPI.subscribeToCategoryKey('ASSETS', assets[i], assetData);
            }

        };

        AssetLoader.prototype.setAssetConfig = function(assetType, assetId, data) {
            PipelineAPI.setCategoryKeyValue('CONFIGS', assetType+'_'+assetId, data);
        };


        var setupAsset = function(assetType, assetId) {
            var assetKey = assetType+assetId;
            var configLoaded = function(src, data) {

                var callback = function(asset) {
                    PipelineAPI.setCategoryKeyValue('ASSET', assetKey, asset);
                };

                new assetMap[assetType](assetId, data.config, callback);
            };

            PipelineAPI.subscribeToCategoryKey('CONFIGS', assetKey, configLoaded);
        };


        var loadAsset = function(assetType, assetId, callback) {
            var assetKey = assetType+assetId;
            var cachedAsset = PipelineAPI.readCachedConfigKey('ASSET', assetKey);
            if (cachedAsset === assetKey) {
                setupAsset(assetType, assetId);
                PipelineAPI.subscribeToCategoryKey('ASSET', assetKey, callback);
            } else {
                callback(cachedAsset);
            }
        };

        AssetLoader.prototype.loadAsset = function(assetType, assetId, callback) {
            loadAsset(assetType, assetId, callback)
        };

        return AssetLoader;

    });