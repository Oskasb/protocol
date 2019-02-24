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

    var inputIndex;
    var worldCam;


    var inputStates = [];

    var sampleInput = function(input, buffer, worldSpacePointers) {

        inputIndex = input;

        if (!inputStates[inputIndex]) {
            inputStates[inputIndex] = {
                lastDX:0,
                lastDY:0
            };
        }

        let inState = inputStates[inputIndex];

        inputBuffer = buffer;

    //    if (input === 0) {
            camera.aspect = GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.ASPECT );
    //    }

        if (GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.WHEEL_DELTA)) {
            GuiAPI.printDebugText("WHEEL DELTA "+GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.WHEEL_DELTA));

            tempVec1.set(0, 0, 2 * MATH.sign(-GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.WHEEL_DELTA)));
        //    inputBuffer[inputIndex+ ENUMS.InputState.WHEEL_DELTA] = 0;
            GuiAPI.setInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.WHEEL_DELTA, 0)
            tempVec1.applyQuaternion(camera.quaternion);
            camera.position.add(tempVec1);
        }


        if (!worldSpacePointers.length) return;

        tpf = MainWorldAPI.getTpf();


        if (GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.ACTION_0)) {

            tempVec1.x = GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.DRAG_DISTANCE_X) - inState.lastDX;
            tempVec1.y = GuiAPI.readInputBufferValue(inputIndex, inputBuffer, ENUMS.InputState.DRAG_DISTANCE_Y) - inState.lastDY;
            tempVec1.z = 0;

            timeFactor =  Math.min(tpf*20, 0.5);

            inState.lastDX = (tempVec1.x + inState.lastDX) * timeFactor + inState.lastDX * (1-timeFactor);
            inState.lastDY = (tempVec1.y + inState.lastDY) * timeFactor + inState.lastDY * (1-timeFactor);

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
            inState.lastDX = 0;
            inState.lastDY = 0;
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


    var char;

    WorldCamera.prototype.tickWorldCamera = function() {
        GuiAPI.setCameraAspect(camera.aspect);

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
        this.updateCameraMatrix();
        this.fireCameraUpdate()

    };

    return WorldCamera;

});