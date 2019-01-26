"use strict";

var GameAPI;

define([
        'workers/main/world/WorldEntity',
        'evt'
    ],
    function(
        WorldEntity,
        evt
    ) {

        var possibleModelAssets = [
            "animated_pilot",
            "animated_barbarian",
            "skinned_barb_bp",
            "skinned_barb_greaves",
            "asset_ninjablade",
            "asset_tree_1",
            "asset_tree_2",
            "asset_tree_3",
            "asset_tree_4"
        ];

        var requestedAssets = {};
        var registeredAssets = {};
        var assetIndex = [];

        var gameAssets;


        var SpawnCall = function(assetKey, cb) {
            this.assetKey = assetKey;
            this.callback = cb
        };


        var GameAssets = function() {
            gameAssets = this;

            this.spawnCalls = {};

        };

        GameAssets.prototype.initGameAPI = function() {

        };


        GameAssets.prototype.initAssetsList = function(list) {
            for (var i = 0; i < list.length; i++) {
                this.requestRenderableAsset(list[i])
            }
        };

        GameAssets.prototype.loadPossibleAssets = function() {
            this.initAssetsList(possibleModelAssets);
        };

        GameAssets.prototype.requestGameAsset = function(modelAssetId, callback) {

            if (!this.spawnCalls[modelAssetId]){
                this.spawnCalls[modelAssetId] = [];
            }

            this.spawnCalls[modelAssetId].push(new SpawnCall(modelAssetId, callback));

        //    console.log("Request game asset:", modelAssetId, registeredAssets, assetIndex);

            if (registeredAssets[modelAssetId]) {
                var aIndex = assetIndex.indexOf(modelAssetId);
                this.requestSpawnableAsset(aIndex);
                return;
            }

            if (!requestedAssets[modelAssetId]) {
                this.requestRenderableAsset(modelAssetId);
            }

        };

        GameAssets.prototype.registerAssetReady = function(msg) {
            registeredAssets[msg[0]] = msg[1];
            assetIndex[msg[1].index] = msg[0];
            GuiAPI.printDebugText("ASSET READY: "+ msg[0]);
            this.updateGameAssetRequests(msg[0]);
            //        console.log("Asset Prepped: ", registeredAssets);
        };

        GameAssets.prototype.registerAssetInstance = function(event) {

            var assetKey = assetIndex[event[1]];
            //    console.log("Asset Instance Ready: ", event);
            GuiAPI.printDebugText("PTR:"+event[3]+" - "+assetKey);
            var worldEntity = new WorldEntity(assetIndex[event[1]], registeredAssets[assetKey], event[3])

            MainWorldAPI.getWorldSimulation().addWorldEntity( worldEntity);

            this.notifyWorldEntitySpawned(worldEntity);
        };

        GameAssets.prototype.notifyWorldEntitySpawned = function(worldEntity) {

            if (this.spawnCalls[worldEntity.assetId]) {
                if (this.spawnCalls[worldEntity.assetId].length) {
                    var spawnCall = this.spawnCalls[worldEntity.assetId].pop();
                    spawnCall.callback(worldEntity);
                }
            }

            this.updateGameAssetRequests();
        };

        GameAssets.prototype.releaseAssetInstance = function(msg) {

        };

        var requestAssetMessage = [ENUMS.Message.REQUEST_ASSET, 'assetId'];

        GameAssets.prototype.requestRenderableAsset = function(assetId) {
            requestedAssets[assetId] = true;
            requestAssetMessage[1] = assetId;
            MainWorldAPI.postToRender(requestAssetMessage)
        };

        var reqEvt = [
            ENUMS.Args.POINTER, 0
        ];

        GameAssets.prototype.requestSpawnableAsset = function(assetIndex) {

            reqEvt[1] = assetIndex;
            evt.fire(ENUMS.Event.REQUEST_ASSET_INSTANCE, reqEvt);
        };

        GameAssets.prototype.spamRandomAssets = function() {

            var count = Object.keys(registeredAssets).length;
            if (!count) return;
            var entry = Math.floor(Math.random()*count);
            this.requestSpawnableAsset(entry);
        };

        GameAssets.prototype.updateGameAssetRequests = function(assetKey) {

            if (this.spawnCalls[assetKey]) {
    //            console.log("Spawn call", assetKey, this.spawnCalls[assetKey])
                if (this.spawnCalls[assetKey].length) {
                    var aIndex = assetIndex.indexOf(assetKey);
                    this.requestSpawnableAsset(aIndex)
                }
            }

        };


        GameAssets.regAssetInstance = function(event) {
    //        console.log("regAssetInstance", event)
            gameAssets.registerAssetInstance(event);
        };

        evt.on(ENUMS.Event.REGISTER_INSTANCE, GameAssets.regAssetInstance);

        return GameAssets;
    });

