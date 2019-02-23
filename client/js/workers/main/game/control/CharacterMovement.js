"use strict";

define([
        'game/control/CharacterFoot',
    ],
    function(
        CharacterFoot
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

            this.feet = [
                new CharacterFoot('FOOT_L'),
                new CharacterFoot('FOOT_R')
            ];


            this.config = {
                turn_rate:1,
                speed:1,
                input_thresh:0.1,
                walk_cycle_speed:1,
                walk_combat_speed:1,
                move_force: 0.05,
                foot_margin:0.2,
                foot_force:0.2,
                foot_reach:0.35,
                sphere_radius: 0.3,
                sphere_mass: 100
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

        CharacterMovement.prototype.updateMovementInputVector = function( ) {
            if (this.getInputAmount() > this.config.input_thresh) {
                this.movementSpeed = this.getInputAmount() * this.config.speed;
                this.inputVector.set(0, 0,  this.movementSpeed);
                this.inputVector.applyQuaternion(this.obj3d.quaternion);
            } else {
                this.movementSpeed = 0;
                this.inputVector.set(0, 0,  0);
            }
        };

        CharacterMovement.prototype.getMovementSpeed = function( ) {
            return this.velocity.length();
        };

        CharacterMovement.prototype.updateMovementInput = function(direction, amount) {
            this.input.direction = direction;
            this.input.amount = amount;
            this.updateMovementQuat();
            this.updateMovementInputVector();
        };


        CharacterMovement.prototype.getCallback = function(key) {
            return this.callbacks[key]
        };


        CharacterMovement.prototype.attachMovementSphere = function(worldEntity) {
            PhysicsWorldAPI.buildMovementSphere(worldEntity, this.config.sphere_radius, this.config.sphere_mass)
        };

        CharacterMovement.prototype.testGroundContact = function(worldEntity, tpf) {

            if (this.groundContact) return true;

            worldEntity.getWorldEntityPosition(tempObj3d.position);

            tempVec2.copy(this.velocity);
            tempVec2.multiplyScalar(tpf);
            tempVec2.add(tempObj3d.position);
            let height = MainWorldAPI.getHeightAtPosition(tempVec2, tempVec1);
            if (tempVec1.y < 0.6) {
                return false;
            }

            let heightAboveGround = tempVec2.y - height;

            if (heightAboveGround < -0.5) {
                tempVec2.y += 1;
                PhysicsWorldAPI.positionWorldEntity(worldEntity, tempVec2)
            } else if (heightAboveGround < 0.2) {
                return true
            }

            if (tempObj3d.position.y <= height+0.2) {
                return true
            }

        };


        CharacterMovement.prototype.updateCharacterFootsteps = function(worldEntity, tpf) {

            let totalContactDepth = 0;

            tempVec1.set(0, 0, 0);

            for (var i = 0; i < this.feet.length; i++) {
                let foot = this.feet[i];
                foot.updateCharacterFoot(worldEntity, this.config, tpf);
                totalContactDepth += this.feet[i].getFootContactDepth();
                tempVec2.subVectors( foot.stepPosition, foot.footPosition);
                if (foot.contactDuration) {
                    tempVec2.multiplyScalar(foot.footContactDepth);
                    tempVec1.add(tempVec2);
                }

            }

            if (totalContactDepth) {
                this.groundContact = true;
                tempVec2.set(0, this.config.foot_force, 0);
               // PhysicsWorldAPI.applyForceToWorldEntity(worldEntity, tempVec2);
            //    tempVec1.y = 0 // this.config.sphere_radius;
                PhysicsWorldAPI.applyForceToWorldEntity(worldEntity, tempVec1);
             //           PhysicsWorldAPI.moveWorldEntity(worldEntity, tempVec1);
            } else {
                this.groundContact = false;
            }

        };

        CharacterMovement.prototype.applyMovementToWorldEntity = function(worldEntity, tpf ) {
            worldEntity.getWorldEntityQuat(tempObj3d.quaternion);
            //    obj3d.quaternion.set(0, 0, 0, 1);
            tempObj3d.quaternion.slerp(this.getInputQuaternion(), tpf * this.config.turn_rate);

            worldEntity.setWorldEntityQuaternion(tempObj3d.quaternion);

            this.velocity.copy(worldEntity.getWorldEntityVelocity());

            let inputStr = this.inputVector.lengthSq();

            let missingVelocity = MATH.clamp(inputStr - this.velocity.lengthSq(), 0, Math.sqrt(inputStr));

            this.updateCharacterFootsteps(worldEntity, tpf);


            let groundContact = this.testGroundContact(worldEntity, tpf);


            if (this.movementSpeed) {

                PhysicsWorldAPI.setWorldEntityLinearFactors(worldEntity, 1, 1, 1);

                if (groundContact) {

                    tempVec1.set(  0, 0, this.config.move_force * missingVelocity * this.movementSpeed / tpf );
                    tempVec1.applyQuaternion(tempObj3d.quaternion);

                    PhysicsWorldAPI.applyForceToWorldEntity(worldEntity, tempVec1);
                    PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 0.8, 1.2)
                } else {
                    PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 0.1, 1)
                }


            } else {

                if (this.velocity.lengthSq() < 0.1  &&  groundContact) {

                //    if (height < 0.5) {
                        this.velocity.set(0, 0, 0);
                        PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 99999, 99999)
                        PhysicsWorldAPI.setWorldEntityLinearFactors(worldEntity, 0, 1, 0)
                //    }

                } else {
                    PhysicsWorldAPI.applyWorldEntityDamping(worldEntity, 0.1, 2.05)
                }
            }



        //    worldEntity.setWorldEntityPosition(tempObj3d.position);
        };


        return CharacterMovement;

    });

