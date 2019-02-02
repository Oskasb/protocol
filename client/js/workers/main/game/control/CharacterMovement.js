"use strict";

define([

    ],
    function(

    ) {

        var tempObj3d = new THREE.Object3D();
        var tempVec1 = new THREE.Vector3();

        var CharacterMovement = function(actor) {

            this.obj3d = new THREE.Object3D();
            this.velocity = new THREE.Vector3();

            this.input = {
                direction:0,
                amount:0
            };

            this.config = {
                turn_rate:1,
                speed:1
            };

            var applyInputUpdate = function(direction, amount) {
                this.updateMovementInput(direction, amount)
            }.bind(this);

            this.callbacks = {
                applyInputUpdate:applyInputUpdate
            }

        };

        CharacterMovement.prototype.initCharacterMovement = function(dataId, workerData, onReady) {
            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                this.applyConfig(this.workerData.data);
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);

            this.workerData.fetchData(dataId, onDataReady);

        };

        CharacterMovement.prototype.applyConfig = function(config) {
            for (var key in config) {
                this.config[key] = config[key];
            }
        };

        CharacterMovement.prototype.readConfig = function(key ) {
            return this.config[key];
        };

        CharacterMovement.prototype.getInputDirection = function( ) {
            return this.input.direction;
        };

        CharacterMovement.prototype.getInputQuaternion = function( ) {
            return this.obj3d.quaternion;
        };

        CharacterMovement.prototype.getInputAmount = function( ) {
            return this.input.amount;
        };

        CharacterMovement.prototype.updateMovementQuat = function( ) {
            this.obj3d.quaternion.set(0, 0, 0, 1);
            this.obj3d.rotateY(this.getInputDirection());
        };

        CharacterMovement.prototype.updateMovementVelocity = function( ) {
            this.velocity.set(0, 0, this.getInputAmount() * this.config.speed);
            this.velocity.applyQuaternion(this.obj3d.quaternion);
        };

        CharacterMovement.prototype.updateMovementInput = function(direction, amount) {
            this.input.direction = direction;
            this.input.amount = amount;
            this.updateMovementQuat();
            this.updateMovementVelocity();
        };


        CharacterMovement.prototype.getCallback = function(key) {
            return this.callbacks[key]
        };

        CharacterMovement.prototype.applyMovementToWorldEntity = function(worldEntity, tpf ) {
            worldEntity.getWorldEntityQuat(tempObj3d.quaternion);
            //    obj3d.quaternion.set(0, 0, 0, 1);
            tempObj3d.quaternion.slerp(this.getInputQuaternion(), tpf * this.config.turn_rate);

            worldEntity.setWorldEntityQuaternion(tempObj3d.quaternion);

            worldEntity.getWorldEntityPosition(tempObj3d.position);
            tempVec1.copy(this.velocity).multiplyScalar(tpf);
            tempObj3d.position.add(tempVec1);
            worldEntity.setWorldEntityPosition(tempObj3d.position);
        };


        return CharacterMovement;

    });

