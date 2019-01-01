"use strict";

define([

    ],
    function(

    ) {

        var ThreeTexture = function(id, config, callback) {

            this.id = id;

            var imgLoaded = function(src, asset) {
             //   console.log(src, asset);
                this.texture = new THREE.CanvasTexture( asset.bitmap );
                this.applyTxSettings(this.texture, this.config.settings);
                this.texture.sourceUrl = asset.url;
                callback(this)
            }.bind(this);

            var txSettingsLoaded = function(src, asset) {
                console.log(src, asset);
                this.config = asset.config;
                ThreeAPI.loadThreeAsset('FILES_IMAGES_', config.img, imgLoaded);
            }.bind(this);

            ThreeAPI.loadThreeAsset('TEXTURE_SETTINGS_', config.settings, txSettingsLoaded);

        };

        ThreeTexture.prototype.applyTxSettings = function(tx, settings) {

            if (settings.combine)           tx.combine          = THREE[settings.combine];
            if (settings.magFilter)         tx.magFilter        = THREE[settings.magFilter];
            if (settings.minFilter)         tx.minFilter        = THREE[settings.minFilter];
            if (settings.wrapS)             tx.wrapS            = THREE[settings.wrapS];
            if (settings.wrapT)             tx.wrapT            = THREE[settings.wrapT];
            if (settings.generateMipmaps)   tx.generateMipmaps  = settings.generateMipmaps;
            if (settings.flipY)             tx.flipY            = settings.flipY;
            tx.needsUpdate = true;

        };


        ThreeTexture.prototype.loadAssetConfigs = function(assets) {


        };


        ThreeTexture.prototype.setAssetConfig = function(assetType, assetId, data) {

        };


        return ThreeTexture;

    });