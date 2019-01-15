"use strict";

define([
    'evt',
    'PipelineAPI',
    '3d/three/instancer/InstanceAPI'

], function(
    evt,
    PipelineAPI,
    InstanceAPI
) {

    var i;
    var assets = [];
    var assetIndex = {};
    var instances = [];
    var spatials = [];
    var msg;

    var pos;
    var quat;
    var obj3d;

    var activeMixers = [];

    var dynamicMain;

    var DynamicMain = function() {
        dynamicMain = this;
    };

    DynamicMain.prototype.requestAsset = function(msg) {

        var onAssetReady = function(asset) {
        //    console.log("AssetReady:", asset);
            assets.push(asset);
            assetIndex[asset.id] = assets.length;
            var idx = assetIndex[asset.id];
            var anims = asset.model.animationKeys;
            var message = {};

            message.index = idx;
            message.animKeys = anims;

            var modelSettings = asset.model.settings;
            if (modelSettings.skin) {
                message.skin = modelSettings.skin
            }

            WorkerAPI.callWorker(ENUMS.Worker.MAIN_WORKER,  [ENUMS.Message.REGISTER_ASSET, [asset.id, message]])
        };

        ThreeAPI.buildAsset(msg,   onAssetReady);
    };


    var instanceEvt = [
        ENUMS.Args.POINTER,             0,
        ENUMS.Args.INSTANCE_POINTER,    0
    ];

    var instancePointer = ENUMS.Numbers.INSTANCE_PTR_0;

    var instanceReady = function(modelInstance) {
        instancePointer++;
        instances.push(modelInstance);
        modelInstance.setPointer(instancePointer);
        instanceEvt[1] = assetIndex[modelInstance.getAssetId()];
        instanceEvt[3] = modelInstance.getPointer();
        evt.fire(ENUMS.Event.REGISTER_INSTANCE, instanceEvt);
    };

    DynamicMain.prototype.getInstanceByPointer = function(ptr) {
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].getPointer() === ptr) {
                return instances[i];
            }
        }
    };

    DynamicMain.prototype.removeFromIsntanceIndex = function(instancedModel) {
        MATH.quickSplice(instances, instancedModel);
    };

    DynamicMain.prototype.requestAssetInstance = function(event) {
        var asset = assets[event[1]];
        asset.instantiateAsset(instanceReady);
    };


    DynamicMain.prototype.tickDynamicMain = function(tpf) {
        InstanceAPI.updateInstances(tpf);
        ThreeAPI.updateAnimationMixers(tpf);
    };

    DynamicMain.requestAssetInstance = function(event) {
        dynamicMain.requestAssetInstance(event);
    };

    DynamicMain.prototype.initiateUiFromBufferMsg = function(bufferMsg) {
        InstanceAPI.setupUiInstancing(bufferMsg);
    };

    evt.on(ENUMS.Event.REQUEST_ASSET_INSTANCE, DynamicMain.requestAssetInstance);

    return DynamicMain;

});