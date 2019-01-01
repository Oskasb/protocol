"use strict";


define([
    '3d/ThreeController',
    'EffectsAPI',
    '3d/effects/EffectListeners',
    '3d/CanvasMain',
    '3d/RenderCamera'

], function(
    ThreeController,
    EffectsAPI,
    EffectsListeners,
    CanvasMain,
    RenderCamera
) {

    var activeMixers = [];

    var SceneController = function() {
    //    this.dynamicMain = new DynamicMain()
        this.canvasMain = new CanvasMain();
    };

    SceneController.prototype.setup3dScene = function(ready) {
        this.renderCamera = new RenderCamera()
        ThreeController.setupThreeRenderer(ready);
    };

    SceneController.prototype.setupEffectPlayers = function(onReady) {
        // main thread init
        EffectsListeners.setupListeners();
        EffectsAPI.initEffects(onReady)
    };

    SceneController.prototype.tickEffectsAPI = function(systemTime) {
        EffectsAPI.tickEffectSimulation(systemTime);
    };

    SceneController.prototype.tickCanvasScene = function(tpf) {
        this.canvasMain.updateCanvasMain(tpf)
    };

    SceneController.prototype.tickDynamicScene = function(tpf) {
        this.dynamicMain.tickDynamicMain();
    };

    SceneController.prototype.activateMixer = function(mixer) {
        activeMixers.push(mixer);
    };

    SceneController.prototype.deActivateMixer = function(mixer) {
        activeMixers.splice(activeMixers.indexOf(mixer), 1);
    };

    SceneController.prototype.tickAnimationMixers = function(tpf) {
        for (var i = 0; i < activeMixers.length; i ++) {
            activeMixers[i].update(tpf);
        }
    };

    SceneController.prototype.tickEnvironment = function(tpf) {
        ThreeAPI.getEnvironment().tickEnvironment(tpf);
    };

    return SceneController;

});