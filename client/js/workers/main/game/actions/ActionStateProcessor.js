"use strict";

define([

    ],
    function(

    ) {


        var actionStateMap = {};
        actionStateMap[ENUMS.ActionState.ACTIVATING]     = 'prep';
        actionStateMap[ENUMS.ActionState.ACTIVE]         = 'exec';
        actionStateMap[ENUMS.ActionState.ON_COOLDOWN]    = 'end';
    //    actionStateMap[ENUMS.ActionState.AVAILABLE]      = 'end';

        var prep = {};

        prep['ATTACK_GREATSWORD'] = [ENUMS.Animations.GD_HNG_R, ENUMS.Animations.GD_BCK_R, ENUMS.Animations.GD_INS_R, ENUMS.Animations.GD_SID_R];

        var exec = {};
        exec['ATTACK_GREATSWORD'] = [ENUMS.Animations.CT_ML_R, ENUMS.Animations.CT_TC_R, ENUMS.Animations.CT_TR_R];

        var end = {};
        end['ATTACK_GREATSWORD'] = [ENUMS.Animations.GD_HNG_R, ENUMS.Animations.GD_BCK_R, ENUMS.Animations.GD_INS_R, ENUMS.Animations.GD_SID_R];


        var ActionStateProcessor = function() {

        };

        var actionMap;
        var animKeys;
        var actionState;
        var key;
        var targetTime;

        ActionStateProcessor.applyActionStateToGamePiece = function(action, gamePiece) {

            actionState = action.getActionState();

        //    console.log("Action state",action.getActionState())

            if (actionState === ENUMS.ActionState.AVAILABLE) {

                return;
            }


        //    console.log("ActionStateUpdate", action.getActionType(), [action]);
            actionMap = gamePiece.getPieceAnimator().getActionMap(action.getActionType());

            animKeys = actionMap[actionStateMap[actionState]];
            if (!animKeys) {
                GuiAPI.printDebugText("NO ANIM KEY "+action.getActionType()+" "+actionState);
            //    console.log("No Keys", action.getActionState(), actionStateMap, actionMap)
                return;
            }
            key = MATH.getRandomArrayEntry(animKeys);

        //    console.log(key)

            if (actionState === ENUMS.ActionState.ON_COOLDOWN) {
                targetTime =action.getActionRecoverTime();
                gamePiece.actionStateEnded(action);
            } else {
                targetTime =action.getActionTargetTime();
            }


            gamePiece.activatePieceAnimation(key, 1, 1/targetTime, targetTime)

        };


        var moveStateMap = {};
        moveStateMap[ENUMS.CharacterState.COMBAT] = 'WALK_COMBAT';
        moveStateMap[ENUMS.CharacterState.IDLE] = 'WALK';

        var stationaryStateMap = {};
        stationaryStateMap[ENUMS.CharacterState.COMBAT] = 'GD_RT_FF';
        stationaryStateMap[ENUMS.CharacterState.IDLE] = 'IDLE';

        var speedRefMap = {};
        speedRefMap[ENUMS.CharacterState.COMBAT] = 'walk_combat_speed';
        speedRefMap[ENUMS.CharacterState.IDLE] = 'walk_cycle_speed';

        var speed;

        var animRefSpeed = 1;

        ActionStateProcessor.applyMovementStateToGamePiece = function(state, movement, gamePiece) {

            speed = movement.getMovementSpeed();

            if (speed) {
                key = moveStateMap[state] ;
                animRefSpeed = movement.readConfig(speedRefMap[state]);
            } else {
                key = stationaryStateMap[state];
                speed = 1;
                animRefSpeed = 1;
            }


            gamePiece.activatePieceAnimation(key, 1, speed / animRefSpeed, 1)

        };

        return ActionStateProcessor;

    });

