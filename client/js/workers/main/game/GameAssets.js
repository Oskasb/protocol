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
            //    "asset_bullet",
            "asset_tree_1",
            "asset_tree_2",
            "asset_tree_3",
            "asset_tree_4"
        ];

        var registeredAssets = {};
        var assetIndex = [];

        var gameAssets;


        var GameAssets = function() {
            gameAssets = this;
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


        GameAssets.prototype.registerAssetReady = function(msg) {
            registeredAssets[msg[0]] = msg[1];
            assetIndex[msg[1].index] = msg[0];
            GuiAPI.printDebugText("ASSET READY: "+ msg[0]);
            //        console.log("Asset Prepped: ", registeredAssets);
        };

        GameAssets.prototype.registerAssetInstance = function(event) {
            //    console.log("Asset Instance Ready: ", event);
            GuiAPI.printDebugText("PTR:"+event[3]+" - "+assetIndex[event[1]]);
            var worldEntity = new WorldEntity(assetIndex[event[1]], registeredAssets[assetIndex[event[1]]], event[3])

            MainWorldAPI.getWorldSimulation().addWorldEntity( worldEntity)
        };

        GameAssets.prototype.releaseAssetInstance = function(msg) {

        };

        var requestAssetMessage = [ENUMS.Message.REQUEST_ASSET, 'assetId'];

        GameAssets.prototype.requestRenderableAsset = function(assetId) {
            requestAssetMessage[1] = assetId;
            MainWorldAPI.postToRender(requestAssetMessage)
        };

        var reqEvt = [
            ENUMS.Args.POINTER, 0
        ];

        GameAssets.prototype.spamRandomAssets = function() {

            var count = Object.keys(registeredAssets).length;
            if (!count) return;
            var entry = Math.floor(Math.random()*count);
            reqEvt[1] = entry;
            evt.fire(ENUMS.Event.REQUEST_ASSET_INSTANCE, reqEvt);
        };



        GameAssets.prototype.requestGameAsset = function(modelAssetId, callback) {

        };

        GameAssets.regAssetInstance = function(event) {
            gameAssets.registerAssetInstance(event);
        };

        evt.on(ENUMS.Event.REGISTER_INSTANCE, GameAssets.regAssetInstance);

        return GameAssets;
    });

