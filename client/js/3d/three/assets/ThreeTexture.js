"use strict";

define([

    ],
    function(

    ) {

        var ThreeTexture = function(id, config, callback) {

            this.id = id;

            var imgLoaded = function(src, asset) {
             //   console.log(src, asset);
                this.texture = new THREE.CanvasTexture( asset.bitmap);
                this.applyTxSettings(this.texture, this.config.settings);
                this.texture.sourceUrl = asset.url;
                callback(this)
            }.bind(this);

            var txSettingsLoaded = function(src, asset) {
        //        console.log(src, asset);
                this.config = asset.config;
                ThreeAPI.loadThreeAsset('FILES_IMAGES_', config.img, imgLoaded);
            }.bind(this);

            ThreeAPI.loadThreeAsset('TEXTURE_SETTINGS_', config.settings, txSettingsLoaded);

        };

        ThreeTexture.prototype.applyTxSettings = function(tx, settings) {

            tx.userData = {};

            if (settings.combine)           tx.combine                  = THREE[settings.combine];
            if (settings.magFilter)         tx.magFilter                = THREE[settings.magFilter];
            if (settings.minFilter)         tx.minFilter                = THREE[settings.minFilter];
            if (settings.wrapS)             tx.wrapS                    = THREE[settings.wrapS];
            if (settings.wrapT)             tx.wrapT                    = THREE[settings.wrapT];

            if (settings.mapping)           tx.mapping                  = THREE[settings.mapping];

            if (settings.generateMipmaps)   tx.generateMipmaps          = settings.generateMipmaps;
            if (settings.flipY)             tx.flipY                    = settings.flipY;
            if (settings.data_rows)         tx.userData.data_rows       = settings.data_rows;
            if (settings.tiles_x)           tx.userData.tiles_x         = settings.tiles_x;
            if (settings.tiles_y)           tx.userData.tiles_y         = settings.tiles_y;
            tx.needsUpdate = true;

        };


        return ThreeTexture;

    });