"use strict";

define([
        'workers/main/camera/WorldCamera',
        'workers/main/world/WorldEntity',
    'evt'
    ],
    function(
        WorldCamera,
        WorldEntity,
        evt
    ) {

        var possibleModelAssets = [
            "animated_pilot",
            "animated_barbarian",
            "skinned_barb_bp",
            "skinned_barb_greaves",
            "asset_bullet",
            "asset_tree_1",
            "asset_tree_2",
            "asset_tree_3",
            "asset_tree_4"
        ];

        var registeredAssets = {};
        var assetIndex = [];

        var worldEntities = [];

        var addEntities = [];

        var worldSimulation;

        var WorldSimulation = function() {
            this.worldCamera = new WorldCamera();
            worldSimulation = this;
        };

        WorldSimulation.prototype.initAssetsList = function(list) {
            for (var i = 0; i < list.length; i++) {
                this.requestRenderableAsset(list[i])
            }
        };

        WorldSimulation.prototype.startWorldSystem = function() {

            this.initAssetsList(possibleModelAssets);
        };


        WorldSimulation.prototype.tickWorldSimulation = function(tpf) {
            this.worldCamera.tickWorldCamera(tpf);
        };

        WorldSimulation.prototype.registerAssetReady = function(msg) {
            registeredAssets[msg[0]] = msg[1];
            assetIndex[msg[1]] = msg[0];
        //    console.log("Asset Prepped: ", registeredAssets);
        };

        WorldSimulation.prototype.registerAssetInstance = function(event) {
        //    console.log("Asset Instance Ready: ", event);
            var worldEntity = new WorldEntity(assetIndex[event[1]], event[3])
            addEntities.push( worldEntity)
        };

        WorldSimulation.prototype.releaseAssetInstance = function(msg) {

        };

        var requestAssetMessage = [ENUMS.Message.REQUEST_ASSET, 'assetId'];

        WorldSimulation.prototype.requestRenderableAsset = function(assetId) {
            requestAssetMessage[1] = assetId;
            MainWorldAPI.postToRender(requestAssetMessage)
        };

        var reqEvt = [
            ENUMS.Args.POINTER, 0
        ];

        WorldSimulation.prototype.spamRandomAssets = function() {

            var count = Object.keys(registeredAssets).length;
            if (!count) return;
            var entry = Math.floor(Math.random()*count);
            reqEvt[1] = entry;
            evt.fire(ENUMS.Event.REQUEST_ASSET_INSTANCE, reqEvt);
        };

        var e;
        WorldSimulation.prototype.addNewEntities = function(time) {
            while (addEntities.length) {
                e = addEntities.pop();
                e.initWorldEntity(time);
                worldEntities.push(e);
            }
        };

        WorldSimulation.prototype.removeRandomAsset = function() {

            var entry = Math.floor(Math.random()*worldEntities.length);

            var we = worldEntities.shift();

            we.decommissionWorldEntity();

        };

        WorldSimulation.prototype.tickWorldSimulation = function(tpf, time) {

            this.worldCamera.tickWorldCamera(tpf);

            if (Math.random()*15+15 < worldEntities.length) {
                this.removeRandomAsset();
            }

            if (Math.random() < 0.85) {
                this.spamRandomAssets();
            }

            this.addNewEntities(time);

        };

        WorldSimulation.regAssetInstance = function(event) {
            worldSimulation.registerAssetInstance(event);
        };

        evt.on(ENUMS.Event.REGISTER_INSTANCE, WorldSimulation.regAssetInstance);

        return WorldSimulation;
    });

