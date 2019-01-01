"use strict";

define([],

    function() {


        var ThreeMaterial = function(id, config, callback) {

            this.textureMap = {};



            var materialSettingsLoaded = function(src, asset) {
                console.log(src, asset);
                this.applyMaterialSettings(asset.config.shader, asset.config.properties);
                this.setupTextureMap(config, callback);

            }.bind(this);

            ThreeAPI.loadThreeAsset('MATERIAL_SETTINGS_', config.settings, materialSettingsLoaded);
        };

        ThreeMaterial.prototype.getAssetMaterial = function() {
            return this.mat;
        };

        ThreeMaterial.prototype.setupTextureMap = function(config, cb) {

            var txRqs = 0;
            var txLds = 0;

            var loadCheck = function() {
                if (txRqs === txLds) {
                    cb(this);
                }
            }.bind(this);

            var textureAssetLoaded = function(src, asset) {
                txLds++;
                this.mat[this.textureMap[asset.id]] = asset.texture;
                console.log(this, src, asset)
                loadCheck()
            }.bind(this);

            if (config.textures) {
                for (var i = 0; i < config.textures.length; i++) {
                    txRqs++;
                    var id = config.textures[i].id;
                    var key = config.textures[i].key;
                    this.textureMap[id] = key;
                    ThreeAPI.loadThreeAsset('TEXTURES_', config.textures[i].id, textureAssetLoaded);
                }
            }

            loadCheck();

        };


        ThreeMaterial.prototype.applyMaterialSettings = function(shader, props) {

         //   console.log(shader, props);

            var mat = new THREE[shader](props.settings);

            if (props.blending) mat.blending = THREE[props.blending];

            if (props.color) {
                mat.color.r = props.color.r;
                mat.color.g = props.color.g;
                mat.color.b = props.color.b;
            }

            if (props.side) mat.side = THREE[props.side];

            this.mat = mat;

        };


        ThreeMaterial.prototype.loadAssetConfigs = function(assets) {

        };


        ThreeMaterial.prototype.setAssetConfig = function(assetType, assetId, data) {

        };

        return ThreeMaterial;

    });