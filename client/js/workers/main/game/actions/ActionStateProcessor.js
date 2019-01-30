"use strict";

define([

    ],
    function(

    ) {

        var imgConf;
        var state_feedback;
        var stateKey;
        var color;
        var sprites;
        var sprite;
        var spriteName;

        var lutColor;
        var bufferElem;
        var feedbackId;


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

        ActionStateProcessor.applyActionStateToGamePiece = function(action, gamePiece) {

            actionState = action.getActionState();

            if (actionState === ENUMS.ActionState.AVAILABLE) {
                gamePiece.actionStateEnded(action);
                return;
            }


        //    console.log("ActionStateUpdate", action.getActionType(), [action]);
            actionMap = gamePiece.getPieceAnimator().getActionMap(action.getActionType());

            animKeys = actionMap[actionStateMap[actionState]];
            if (!animKeys) {
            //    console.log("No Keys", action.getActionState(), actionStateMap, actionMap)
                return;
            }
            var key = MATH.getRandomArrayEntry(animKeys);
        //    console.log(key)

            gamePiece.activatePieceAnimation(key, 1, 1/action.getActionTargetTime(), action.getActionTargetTime())

        };




        return ActionStateProcessor;

    });

