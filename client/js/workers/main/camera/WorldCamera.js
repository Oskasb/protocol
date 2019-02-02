"use strict";

define([
    'evt'
], function(
    evt
) {

    var camera;

    var lookAt = new THREE.Vector3();
    var tempVec1 = new THREE.Vector3();
    var vector = new THREE.Vector3();

    var distance;

    var direction = 0;

    var minDistance = 0.2;
    var maxDistance = 2000;

    var cameraForward = new THREE.Vector3();

    var inputBuffer;

    var lastDX = 0;
    var lastDY = 0;

    var timeFactor = 0;
    var dist = 0;
    var distPost = 0;
    var tpf;

    var startIndex;
    var worldCam;

    var sampleInput = function(input, buffer, worldSpacePointers) {

        if (!worldSpacePointers.length) return;

        tpf = MainWorldAPI.getTpf();

        startIndex = input;

        inputBuffer = buffer;
        camera.aspect = inputBuffer[startIndex + ENUMS.InputState.ASPECT];

        if (inputBuffer[startIndex+ ENUMS.InputState.ACTION_0]) {

            tempVec1.x = inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_X] - lastDX ;
            tempVec1.y = inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_Y] - lastDY ;
            tempVec1.z = 0;

            timeFactor =  Math.min(tpf*20, 0.5);

            lastDX = inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_X] * timeFactor + lastDX * (1-timeFactor);
            lastDY = inputBuffer[startIndex+ ENUMS.InputState.DRAG_DISTANCE_Y] * timeFactor + lastDY * (1-timeFactor);

            dist = worldCam.calcDistanceToCamera(worldCam.getCameraLookAt());
            tempVec1.multiplyScalar(dist);

            tempVec1.applyQuaternion(camera.quaternion);
            camera.position.add(tempVec1);

            distPost = worldCam.calcDistanceToCamera(worldCam.getCameraLookAt());

            tempVec1.x = 0;
            tempVec1.y = 0;
            tempVec1.z = dist-distPost;

            tempVec1.applyQuaternion(camera.quaternion);
            camera.position.add(tempVec1);

        } else {
            lastDX = 0;
            lastDY = 0;
        }
    };


    var WorldCamera = function() {
        camera = new THREE.PerspectiveCamera( 45, 1, 0.3, 50000 );
        camera.position.set(0, 3, -4);
        lookAt.y = 1.6

        worldCam = this;

        var inputUpdateCallback = function(input, buffer) {

            sampleInput(input, buffer, GuiAPI.getWorldSpacePointers());

        };

        GuiAPI.addInputUpdateCallback(inputUpdateCallback);
    };



    WorldCamera.prototype.cameraFrustumContainsPoint = function(vec3) {
        return frustum.containsPoint(vec3)
    };

    WorldCamera.prototype.toScreenPosition = function(vec3, store) {

        if (!frustum.containsPoint(vec3)) {

            store.x = -1;
            store.y = -1;
            store.z = -100000;

            return store;// Do something with the position...
        }

        vector.copy(vec3);
        vector.project(camera);

        store.x = GuiAPI.scaleByWidth(vector.x * 0.5);
        store.y = GuiAPI.scaleByHeight(vector.y * 0.5);

        store.z = -1;

        return store;
    };


    WorldCamera.prototype.testBoxVisible = function(box) {
        return frustum.intersectsBox(box)
    };

    var isVisible;

    WorldCamera.prototype.testPosRadiusVisible = function(pos, radius) {


        var distance = pos.distanceTo(camera.position);

        if (distance < radius) {
            return true;
        }


        if (distance > 150 + Math.sqrt(radius + 150) + 15 * radius * radius) {
            return false;
        }

        vector.subVectors(camera.position, pos);
        vector.normalize();


        var dot = vector.dot(cameraForward);

        if (dot < 0.2) {
            return false;
        }


        isVisible = this.cameraFrustumContainsPoint(pos);

        if (!isVisible) {
            isVisible = this.cameraTestXYZRadius(pos, radius);
        }

        return isVisible;
    };

    var sphere = new THREE.Sphere();

    WorldCamera.prototype.cameraTestXYZRadius = function(vec3, radius) {
        sphere.center.copy(vec3);
        sphere.radius = radius;
        return frustum.intersectsSphere(sphere);
    };

    WorldCamera.prototype.calcDistanceToCamera = function(vec3) {
        return vec3.distanceTo(camera.position);
    };

    var frustum = new THREE.Frustum();
    var frustumMatrix = new THREE.Matrix4();

    WorldCamera.prototype.setCameraPosition = function(px, py, pz) {
        camera.position.x = px;
        camera.position.y = py;
        camera.position.z = pz;
    };

    WorldCamera.prototype.setCameraPosVec = function(vec3) {
        camera.position.copy(vec3);
    };

    WorldCamera.prototype.getCameraPosition = function(vec3) {
        vec3.copy(camera.position);
    };

    WorldCamera.prototype.getCameraLookAt = function() {
        return lookAt;
    };

    WorldCamera.prototype.setLookAtVec = function(vec) {
        lookAt.copy(vec);
    };

    WorldCamera.prototype.updateCameraLookAt = function() {
        camera.lookAt(lookAt)
    };

    WorldCamera.prototype.getCameraDirection = function() {
        return direction;
    };

    WorldCamera.prototype.setCameraLookAt = function(x, y, z) {
        lookAt.set(x, y, z);
        camera.up.set(0, 1, 0);
        camera.lookAt(lookAt)
    };

    WorldCamera.prototype.distanceToLookTarget = function() {
        return this.calcDistanceToCamera(this.getCameraLookAt());
    };

    WorldCamera.prototype.updateCameraMatrix = function() {

        camera.updateMatrixWorld(true);

        cameraForward.set(0, 0, 1);
        cameraForward.applyQuaternion(camera.quaternion);

        camera.updateProjectionMatrix();

        frustum.setFromMatrix(frustumMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    //    camera.needsUpdate = true;

        for (var i = 0; i < camera.children.length; i++) {
            camera.children[i].updateMatrixWorld(true);
        }

    };

    WorldCamera.prototype.getCamera = function() {
        return camera;
    };

    WorldCamera.prototype.updateCameraControlState = function() {

        tempVec1.set(WorldAPI.getCom(ENUMS.BufferChannels.UI_CAM_DRAG_X), WorldAPI.getCom(ENUMS.BufferChannels.UI_CAM_DRAG_Y), WorldAPI.getCom(ENUMS.BufferChannels.UI_CAM_DRAG_Z));

        distance = this.distanceToLookTarget();

        if (distance < minDistance) {
            if (tempVec1.z < 0) {
                tempVec1.z = 0.1;
            }
        } else if (distance > maxDistance) {
            if (tempVec1.z > 0) {
                tempVec1.z = -0.1;
            }
        }

        WorldAPI.setCom(ENUMS.BufferChannels.UI_CAM_DRAG_X, tempVec1.x * 0.95);
        WorldAPI.setCom(ENUMS.BufferChannels.UI_CAM_DRAG_Y, tempVec1.y * 0.95);
        WorldAPI.setCom(ENUMS.BufferChannels.UI_CAM_DRAG_Z, tempVec1.z * 0.95 || 0);

        tempVec1.applyQuaternion(camera.quaternion);

        camera.position.x += tempVec1.x * (0.2+distance*0.02);
        camera.position.y += tempVec1.y * (0.2+distance*0.02);
        camera.position.z += tempVec1.z * (0.2+distance*0.02);

    };

    WorldCamera.prototype.followActiveSelection = function(renderable) {

        if (renderable) {
            renderable.getDynamicSpatialVelocity(tempVec1);
            tempVec1.multiplyScalar(WorldAPI.getCom(ENUMS.BufferChannels.TPF)/1000);
            camera.position.add(tempVec1);
        }

    };

    var camEvt = [
        ENUMS.Args.POS_X,       0,
        ENUMS.Args.POS_Y,       0,
        ENUMS.Args.POS_Z,       0,
        ENUMS.Args.QUAT_X,      0,
        ENUMS.Args.QUAT_Y,      0,
        ENUMS.Args.QUAT_Z,      0,
        ENUMS.Args.QUAT_W,      0,
        ENUMS.Args.CAM_FOV,     0,
        ENUMS.Args.CAM_NEAR,    0,
        ENUMS.Args.CAM_FAR,     0,
        ENUMS.Args.CAM_ASPECT,  0
    ];



    WorldCamera.prototype.fireCameraUpdate = function() {



        evt.setArgVec3(camEvt, 0, camera.position);
        evt.setArgQuat(camEvt, 6, camera.quaternion);

        camEvt[15] = camera.fov;
        camEvt[17] = camera.near;
        camEvt[19] = camera.far;
        camEvt[21] = camera.aspect;

        evt.fire(ENUMS.Event.UPDATE_CAMERA, camEvt);
    };


    var t = 0;
    var char;

    WorldCamera.prototype.tickWorldCamera = function() {
        GuiAPI.setCameraAspect(camera.aspect);
        t+=tpf;

        char = GameAPI.getPlayerCharacter();

        if (char) {
            char.getCharacterPosition(tempVec1);
            tempVec1.y += 1.3;
            lookAt.sub(tempVec1);
            camera.position.sub(lookAt);

        } else {
            tempVec1.x = 0;
            tempVec1.y = 1.3;
            tempVec1.z = 0;
        }

        this.setLookAtVec(tempVec1);

        tempVec1.sub(camera.position);
        direction = MATH.vectorXZToAngleAxisY(tempVec1);

        this.updateCameraLookAt();
        this.fireCameraUpdate();
        this.updateCameraMatrix();
    };

    return WorldCamera;

});