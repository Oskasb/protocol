"use strict";

define([

    ],
    function(

    ) {

        var tempObj3d = new THREE.Object3D();
        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();
        var tempVec3 = new THREE.Vector3();

        var CharacterMovement = function(actor) {

            this.obj3d = new THREE.Object3D();
            this.velocity = new THREE.Vector3();
            this.inputVector = new THREE.Vector3();

            this.movementSpeed = 0;

            this.input = {
                direction:0,
                amount:0
            };

            this.config = {
                turn_rate:1,
                speed:1,
                input_thresh:0.1,
                walk_cycle_speed:1,
                walk_combat_speed:1
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
            if (this.getInputAmount() > this.config.input_thresh) {
                this.movementSpeed = this.getInputAmount() * this.config.speed;
                this.inputVector.set(0, 0,  this.movementSpeed);
                this.inputVector.applyQuaternion(this.obj3d.quaternion);
            } else {
                this.movementSpeed = 0;
                this.velocity.set(0, 0,  0);
            }
        };

        CharacterMovement.prototype.getMovementSpeed = function( ) {
            return this.velocity.length();
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


        CharacterMovement.prototype.attachMovementSphere = function(worldEntity) {
            PhysicsWorldAPI.buildMovementSphere(worldEntity)
        };

        CharacterMovement.prototype.testGroundContact = function(worldEntity) {
            worldEntity.getWorldEntityPosition(tempObj3d.position);

            let height = MainWorldAPI.getHeightAtPosition(tempObj3d.position, tempVec1);
            if (tempVec1.y < 0.6) {
                return false;
            }
            return tempObj3d.position.y <= height+0.2;

        };


        CharacterMovement.prototype.applyMovementToWorldEntity = function(worldEntity, tpf ) {
            worldEntity.getWorldEntityQuat(tempObj3d.quaternion);
            //    obj3d.quaternion.set(0, 0, 0, 1);
            tempObj3d.quaternion.slerp(this.getInputQuaternion(), tpf * this.config.turn_rate);

            worldEntity.setWorldEntityQuaternion(tempObj3d.quaternion);

            this.velocity.copy(worldEntity.getWorldEntityVelocity());



            tempVec1.set(  0, 0, 0.05 * this.movementSpeed / tpf );
        //    tempVec1.set(  0, this.movementSpeed * tpf, 0);
            tempVec1.applyQuaternion(tempObj3d.quaternion);
            tempVec3.copy(tempVec1);
            tempVec2.set( this.velocity.x, 0,  this.velocity.y);
            tempVec2.normalize();
            tempVec1.y = 0;
            tempVec1.normalize();



            //   PhysicsWorldAPI.applyTorqueToWorldEntity(worldEntity, tempVec1)

            worldEntity.getWorldEntityPosition(tempObj3d.position);

            tempObj3d.position.add(tempVec1);

            let height = MainWorldAPI.getHeightAtPosition(tempObj3d.position);
            tempObj3d.position.y = height;

            let groundContact = this.testGroundContact(worldEntity);

            if (this.movementSpeed && groundContact) {

                PhysicsWorldAPI.applyForceToWorldEntity(worldEntity, tempVec3);

                PhysicsWorldAPI.setWorldEntityLinearFactors(worldEntity, 1, 1, 1);
                PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 6.6, 8.5)

            } else {

                if (this.velocity.lengthSq() < 0.1  &&  groundContact) {

                //    if (height < 0.5) {
                        this.velocity.set(0, 0, 0);
                        PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 99999, 99999)
                        PhysicsWorldAPI.setWorldEntityLinearFactors(worldEntity, 0, 1, 0)
                //    }

                } else {
                    PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 0.1, 5)
                }
            }



        //    worldEntity.setWorldEntityPosition(tempObj3d.position);
        };


        return CharacterMovement;

    });

