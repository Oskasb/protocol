"use strict";

var ThreeAPI;

define([
        'application/load/AssetLoader',
        '3d/three/assets/ThreeAsset',
        '3d/three/ThreeSetup',
        '3d/three/ThreeShaderBuilder',
        '3d/three/ThreeModelLoader',
        '3d/three/ThreeTextureMaker',
        '3d/three/ThreeMaterialMaker',
        '3d/three/ThreeFeedbackFunctions',
        '3d/three/ThreeEnvironment',
        '3d/three/ThreeRenderFilter',
        '3d/three/ThreeSpatialFunctions'
],
    function(
        AssetLoader,
        ThreeAsset,
        ThreeSetup,
        ThreeShaderBuilder,
        ThreeModelLoader,
        ThreeTextureMaker,
        ThreeMaterialMaker,
        ThreeFeedbackFunctions,
        ThreeEnvironment,
        ThreeRenderFilter,
        ThreeSpatialFunctions
    ) {

        var shaderBuilder;
        var glContext;
        var renderer;
        var camera;
        var scene;
        var reflectionScene;
        var spatialFunctions;
        var effectCallbacks;
        var renderFilter;
        var assetLoader;

        var animationMixers = [];
    //    THREE.Object3D.DefaultMatrixAutoUpdate = false;

        ThreeAPI = function() {

        };

        ThreeAPI.initThreeLoaders = function() {
            shaderBuilder = new ThreeShaderBuilder();
            spatialFunctions = new ThreeSpatialFunctions();
            renderFilter = new ThreeRenderFilter();
        //    ThreeEnvironment.loadEnvironmentData();
        };

        ThreeAPI.initEnvironment = function(store) {

            var envReady = function() {
                ThreeEnvironment.enableEnvironment();
            };

            var onLoaded = function() {
                ThreeEnvironment.initEnvironment(store, envReady);
            };

            ThreeEnvironment.loadEnvironmentData(onLoaded);

        };

        ThreeAPI.initThreeScene = function(containerElement, pxRatio, antialias) {
            var store = {};
            store = ThreeSetup.initThreeRenderer(pxRatio, antialias, containerElement, store);
            scene = store.scene;
            camera = store.camera;
            renderer = store.renderer;
            reflectionScene = store.reflectionScene;

            ThreeAPI.initEnvironment(store);
            glContext = store.renderer.context;

            ThreeSetup.addPrerenderCallback(ThreeModelLoader.updateActiveMixers);

            ThreeSetup.addToScene(ThreeSetup.getCamera());
            assetLoader = new AssetLoader();
        };

        ThreeAPI.addPrerenderCallback = function(callback) {
            ThreeSetup.addPrerenderCallback(callback);
        };

        ThreeAPI.addPostrenderCallback = function(callback) {
            ThreeSetup.addPostrenderCallback(callback);
        };

        ThreeAPI.loadThreeModels = function(TAPI) {
            ThreeModelLoader.loadData();
        };

        ThreeAPI.loadThreeData = function(TAPI) {
            ThreeModelLoader.loadData();
            ThreeModelLoader.loadTerrainData(TAPI);
            ThreeTextureMaker.loadTextures();
            ThreeMaterialMaker.loadMaterialist();
        };

        ThreeAPI.loadShaders = function() {
            shaderBuilder.loadShaderData(glContext);
        };

        ThreeAPI.buildAsset = function(assetId, callback) {
            new ThreeAsset(assetId, callback);
        };

        ThreeAPI.loadThreeAsset = function(assetType, assetId, callback) {
            assetLoader.loadAsset(assetType, assetId, callback);
        };

        ThreeAPI.getTimeElapsed = function() {
            return ThreeSetup.getTotalRenderTime();
        };

        ThreeAPI.getSetup = function() {
            return ThreeSetup;
        };

        ThreeAPI.getContext = function() {
            return glContext;
        };

        ThreeAPI.setEffectCallbacks = function(callbacks) {
            effectCallbacks = callbacks;
        };

        ThreeAPI.getEffectCallbacks = function() {
            return effectCallbacks;
        };

        ThreeAPI.getSpatialFunctions = function() {
            return spatialFunctions;
        };

        ThreeAPI.readEnvironmentUniform = function(worldProperty, key) {
            return ThreeEnvironment.readDynamicValue(worldProperty, key);
        };

        ThreeAPI.getEnvironment = function() {
            return ThreeEnvironment;
        };

        ThreeAPI.getModelLoader = function() {
            return ThreeModelLoader;
        };

        ThreeAPI.getCamera = function() {
            return camera;
        };

        ThreeAPI.getScene = function() {
            return scene;
        };

        ThreeAPI.getReflectionScene = function() {
            return reflectionScene;
        };

        ThreeAPI.getRenderer = function() {
            return renderer;
        };

        ThreeAPI.plantVegetationAt = function(pos, normalStore) {
            return ThreeModelLoader.terrainVegetationAt(pos, normalStore);
        };
        
        ThreeAPI.setYbyTerrainHeightAt = function(pos, normalStore) {
            return ThreeModelLoader.getHeightFromTerrainAt(pos, normalStore);
        };
        
        ThreeAPI.updateWindowParameters = function(width, height, aspect, pxRatio) {
            ThreeSetup.setRenderParams(width, height, aspect, pxRatio);
        };

        ThreeAPI.registerUpdateCallback = function(callback) {
            ThreeSetup.attachPrerenderCallback(callback);
        };

        ThreeAPI.sampleFrustum = function(store) {
            ThreeSetup.sampleCameraFrustum(store);
        };

        ThreeAPI.addAmbientLight = function() {
           
        };
        
        ThreeAPI.setCameraPos = function(x, y, z) {
            ThreeSetup.setCameraPosition(x, y, z);
        };

        ThreeAPI.cameraLookAt = function(x, y, z) {
            ThreeSetup.setCameraLookAt(x, y, z);
        };

        ThreeAPI.updateCamera = function() {
            ThreeSetup.updateCameraMatrix();
        };

        ThreeAPI.toScreenPosition = function(vec3, store) {
            ThreeSetup.toScreenPosition(vec3, store);
        };

        ThreeAPI.checkVolumeObjectVisible = function(vec3, radius) {
            return ThreeSetup.cameraTestXYZRadius(vec3, radius);
        };

        ThreeAPI.distanceToCamera = function(vec3) {
            return ThreeSetup.calcDistanceToCamera(vec3);
        };        
        
        ThreeAPI.newCanvasTexture = function(canvas) {
            return ThreeTextureMaker.createCanvasTexture(canvas);
        };

        ThreeAPI.buildCanvasHudMaterial = function(canvasTexture) {
            return ThreeMaterialMaker.createCanvasHudMaterial(canvasTexture);
        };

        ThreeAPI.buildCanvasMaterial = function(canvasTexture) {
            return ThreeMaterialMaker.createCanvasMaterial(canvasTexture);
        };
        
        ThreeAPI.buildCanvasObject = function(model, canvas, store) {
            var tx = ThreeAPI.newCanvasTexture(canvas);
            var mat = ThreeMaterialMaker.createCanvasHudMaterial(tx);
            ThreeModelLoader.applyMaterialToMesh(mat, model);
            store.texture = tx;
            store.materia = mat;
            return store;
        };

        ThreeAPI.attachObjectToCamera = function(object) {
         //   ThreeSetup.addToScene(ThreeSetup.getCamera());
            ThreeSetup.addChildToParent(object, ThreeSetup.getCamera());
        };

        ThreeAPI.applySpatialToModel = function(spatial, model) {
            if (!model) return;
            ThreeAPI.transformModel(model, spatial.posX(), spatial.posY(), spatial.posZ(), spatial.pitch(), spatial.yaw(), spatial.roll())
        };


        ThreeAPI.transformModel = function(model, px, py, pz, rx, ry, rz) {
            model.position.set(px, py, pz);
            model.rotation.set(rx, ry, rz, 'ZYX');
        };

        ThreeAPI.addToScene = function(threeObject) {
            ThreeSetup.addToScene(threeObject);
        };

        ThreeAPI.createRootObject = function() {
            return ThreeModelLoader.createObject3D();
        };

        ThreeAPI.removeChildrenFrom = function(object) {
            while (object.children.length) {
                ThreeAPI.removeModel(object.children.pop());
            }
        };

        ThreeAPI.loadMeshModel = function(modelId, rootObject, partsReady) {
            return ThreeModelLoader.loadThreeMeshModel(modelId, rootObject, ThreeSetup, partsReady);
        };

        ThreeAPI.attachInstancedModel = function(modelId, rootObject) {
            return ThreeModelLoader.attachInstancedModelTo3DObject(modelId, rootObject, ThreeSetup);
        };


        ThreeAPI.loadModel = function(sx, sy, sz, partsReady) {
            return ThreeModelLoader.loadThreeModel(sx, sy, sz, partsReady);
        };

        ThreeAPI.loadDebugBox = function(sx, sy, sz, colorName) {
            return ThreeModelLoader.loadThreeDebugBox(sx, sy, sz, colorName);
        };
        
        ThreeAPI.loadQuad = function(sx, sy) {
            var model = ThreeModelLoader.loadThreeQuad(sx, sy);
            return ThreeSetup.addToScene(model);
        };

        ThreeAPI.loadGround = function(applies, array1d, rootObject, partsReady) {
            return ThreeModelLoader.loadGroundMesh(applies, array1d, rootObject, ThreeSetup, partsReady);
        };

        ThreeAPI.removeTerrainByPosition = function(pos) {
            return ThreeModelLoader.removeGroundMesh(pos);
        };


        ThreeAPI.addChildToObject3D = function(child, parent) {
            ThreeSetup.addChildToParent(child, parent);
        };

        ThreeAPI.animateModelTexture = function(model, z, y, cumulative) {
            ThreeFeedbackFunctions.applyModelTextureTranslation(model, z, y, cumulative)
        };
        
        ThreeAPI.setObjectVisibility = function(object3d, bool) {
            object3d.visible = bool;
        };

        ThreeAPI.showModel = function(obj3d) {
            ThreeSetup.addToScene(obj3d);
        };

        ThreeAPI.bindDynamicStandardGeometry = function(modelId, dynamicBuffer) {

            console.log("bindDynamicStandardGeometry", modelId, dynamicBuffer);

        };


        ThreeAPI.hideModel = function(obj3d) {
            ThreeSetup.removeModelFromScene(obj3d);
        };

        ThreeAPI.removeModel = function(model) {

//            ThreeSetup.removeModelFromScene(model);
            ThreeModelLoader.returnModelToPool(model);
        };

        ThreeAPI.disposeModel = function(model) {

            ThreeSetup.removeModelFromScene(model);
            ThreeModelLoader.disposeHierarchy(model);
        };
        
        ThreeAPI.countAddedSceneModels = function() {
            return ThreeSetup.getSceneChildrenCount();
        };

        ThreeAPI.sampleRenderInfo = function(source, key) {
            return ThreeSetup.getInfoFromRenderer(source, key);
        };

        ThreeAPI.countPooledModels = function() {
            return ThreeModelLoader.getPooledModelCount();
        };

        ThreeAPI.activateMixer = function(mixer) {
            animationMixers.push(mixer);
        };

        ThreeAPI.deActivateMixer = function(mixer) {
            MATH.quickSplice(animationMixers, mixer);
        };

        ThreeAPI.updateAnimationMixers = function(tpf) {
            for (var i = 0; i < animationMixers.length; i ++) {
                animationMixers[i].update(tpf);
            }
        };


        ThreeAPI.toRgb = function(r, g, b) {
            return 'rgb('+Math.floor(r*255)+','+Math.floor(g*255)+','+Math.floor(b*255)+')';
        };

        return ThreeAPI;
    });

