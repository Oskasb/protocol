"use strict";

define([        'application/PipelineObject'],

    function(PipelineObject) {


        var ThreeMaterial = function(id, config, callback) {

            this.textureMap = {};

            this.textures = {};

            var matReady = function() {

                for (var key in this.textureMap) {
                    this.mat[this.textureMap[key]] = this.textures[this.textureMap[key]].texture;
                }

                callback(this);
            }.bind(this);


            var materialSettingsLoaded = function(src, asset) {
                this.applyMaterialSettings(asset.config.shader, asset.config.properties, matReady);
            }.bind(this);


            var txReady = function() {
                ThreeAPI.loadThreeAsset('MATERIAL_SETTINGS_', config.settings, materialSettingsLoaded);
            }.bind(this);

            this.setupTextureMap(config, txReady);

        };

        ThreeMaterial.prototype.getAssetMaterial = function() {
            return this.mat;
        };

        ThreeMaterial.prototype.setupTextureMap = function(config, cb) {

            var txRqs = 0;
            var txLds = 0;

            var loadCheck = function() {
                if (txRqs === txLds) {
                    cb();
                }
            }.bind(this);

            var textureAssetLoaded = function(src, asset) {
                txLds++;
                this.textures[this.textureMap[asset.id]] = asset;
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


        ThreeMaterial.prototype.applyMaterialSettings = function(shader, props, cb) {

            if (props.program) {
                this.setupCustomShaderMaterial(shader, props, cb);
                return;
            }

            var mat = new THREE[shader](props.settings);

            if (props.blending) {
                mat.blending = THREE[props.blending];
            }

            if (props.color) {
                mat.color.r = props.color.r;
                mat.color.g = props.color.g;
                mat.color.b = props.color.b;
            }

            if (props.side) mat.side = THREE[props.side];

            this.mat = mat;
            cb(this);
        };


        ThreeMaterial.prototype.setupCustomShaderMaterial = function(shader, props, cb) {

            var mapTexture = this.textures['map'].texture;
            if (props.data_texture) var dataTx = this.textures[props.data_texture].texture;

            var applyShaders = function(src, data) {

                props.shaders = data;

                var uniforms = {
                    systemTime: {value:5},
                    alphaTest:  {value:props.settings.alphaTest},
                    map:        {value:mapTexture},
                    tiles:      {value:new THREE.Vector2(mapTexture.userData.tiles_x, mapTexture.userData.tiles_y)}
                };

                if (props.data_texture) {
                    uniforms.data_texture =  {value:dataTx};
                    uniforms.data_rows    =  {value:dataTx.userData.data_rows}
                }

                if (props.global_uniforms) {
                    for (var key in props.global_uniforms) {
                        uniforms[key] = props.global_uniforms[key];
                    }
                }

                var opts = {
                    uniforms: uniforms,
                    side: THREE.DoubleSide,
                    vertexShader: props.shaders.vertex,
                    fragmentShader: props.shaders.fragment
                };

                if (props.blending) {
                    opts.blending = THREE[props.blending];
                }

                if (props.side) opts.side = THREE[props.side];

                var mat = new THREE[shader](opts);

                if (props.color) {
                    mat.color.r = props.color.r;
                    mat.color.g = props.color.g;
                    mat.color.b = props.color.b;
                }

                this.mat = mat;

                cb(this);

            }.bind(this);

            this.shaderPipe = new PipelineObject("SHADERS", props.program, applyShaders);

        };


        ThreeMaterial.prototype.setAssetConfig = function(assetType, assetId, data) {

        };

        return ThreeMaterial;

    });