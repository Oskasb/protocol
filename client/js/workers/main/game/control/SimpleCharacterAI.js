"use strict";

define([

    ],
    function() {

        var tempQuat = new THREE.Quaternion();
        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();
        var tempVec3 = new THREE.Vector3();

        var formation = [
            [2.5, 0, -0.5],
            [-2.5, 0, -0.5],
            [1.4, 0, -1.5],
        ];

        var SimpleCharacterAI = function() {

            var updateAi = function(tpf, time, character) {
                this.updateCharacterAI(tpf, time, character)
            }.bind(this);

            this.callbacks = {
                updateAi:updateAi
            }

        };


        SimpleCharacterAI.prototype.getUpdateCallback = function() {
            return this.callbacks.updateAi;
        };

        SimpleCharacterAI.prototype.setFormationIndex = function(idx) {
            this.formationIndex = idx;
        };

        SimpleCharacterAI.prototype.updateCharacterAI = function(tpf, time, character) {

            character.getCharacterPosition(tempVec1);
            let playerChar = GameAPI.getPlayerCharacter();
            playerChar.getCharacterPosition(tempVec2);


            let form = formation[this.formationIndex];
            tempVec3.set(form[0], form[1], form[2]);
            playerChar.getCharacterQuaternion(tempQuat);
            tempVec3.applyQuaternion(tempQuat);
            tempVec2.add(tempVec3);
            tempVec2.sub(tempVec1);

            let dir = MATH.vectorXZToAngleAxisY(tempVec2);

            let distance = tempVec2.length();
            let amount = 1;
            if (distance < 1) {
                amount = distance;
                dir = character.getCharacterMovement().input.direction
            }

            if (distance < 0.5) {
                amount = 0 // distance*0.5;

                dir = playerChar.getCharacterMovement().input.direction

            }

            character.getCharacterMovement().updateMovementInput(dir, amount)

        };

        return SimpleCharacterAI;

    });

