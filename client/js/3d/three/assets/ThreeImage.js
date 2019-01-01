"use strict";

define([

    ],
    function(

    ) {

        var ThreeImage = function(id, config, callback) {

            this.id = id;
            this.url = config.url;

            var bitmapLoaded = function(bmp) {
                this.bitmap = bmp;
                callback(this)
            }.bind(this);

            var loader = new THREE.ImageBitmapLoader();

            loader.load( config.url, function ( imageBitmap ) {
                bitmapLoaded(imageBitmap);
            });

        };

        ThreeImage.prototype.initAssetConfigs = function() {


        };


        ThreeImage.prototype.loadAssetConfigs = function(assets) {


        };


        ThreeImage.prototype.setAssetConfig = function(assetType, assetId, data) {

        };


        return ThreeImage;

    });