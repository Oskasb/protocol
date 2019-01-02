"use strict";


define([

    ],
    function(

    ) {

        var animationEvent = [];
        var key;
        var i;
        var animStates;
        var modelEvent = [];
        var obj3d;
        var count;
        var stride;

        var EventParser = function() {};

        var parser = [];
        parser[ENUMS.Event.UPDATE_MODEL] = function(modelInstance, event) {
            obj3d = modelInstance.obj3d;

            obj3d.position.x     =  event[1]   ;
            obj3d.position.y     =  event[2]   ;
            obj3d.position.z     =  event[3]   ;
            obj3d.quaternion.x   =  event[4]   ;
            obj3d.quaternion.y   =  event[5]   ;
            obj3d.quaternion.z   =  event[6]   ;
            obj3d.quaternion.w   =  event[7]   ;
            obj3d.scale.x        =  event[8]   ;
            obj3d.scale.y        =  event[9]   ;
            obj3d.scale.z        =  event[10]   ;

            if (modelInstance.active !== event[11]) {
                modelInstance.setActive(event[11]);
            }
        };

        var readAnimation = function(modelInstance, index, animEvent) {
            modelInstance.updateAnimationState(animEvent[index+1], animEvent[index+2], animEvent[index+3])
        };

        parser[ENUMS.Event.UPDATE_ANIMATIONS] = function(modelInstance, event) {
            count = event[1];
            stride = 3;
            for (i = 0; i < count; i++) {
                readAnimation(modelInstance, stride*i+1, event);
            }
        };

        EventParser.parseEntityEvent = function(modelInstance, event) {
            if (!parser[event[0]]) {
                console.log("Bad event: ", event);
                return;
            }
            parser[event[0]](modelInstance, event);
        };

        EventParser.worldEntityEvent = function(worldEntity) {

            obj3d = worldEntity.obj3d;
            modelEvent[0] = ENUMS.Event.UPDATE_MODEL;
            modelEvent[1] = obj3d.position.x;
            modelEvent[2] = obj3d.position.y;
            modelEvent[3] = obj3d.position.z;
            modelEvent[4] = obj3d.quaternion.x;
            modelEvent[5] = obj3d.quaternion.y;
            modelEvent[6] = obj3d.quaternion.z;
            modelEvent[7] = obj3d.quaternion.w;
            modelEvent[8] = obj3d.scale.x;
            modelEvent[9] = obj3d.scale.y;
            modelEvent[10] = obj3d.scale.z;
            modelEvent[11] = worldEntity.active;
            return modelEvent;
        };

        var addAnimation = function(animState, index, animEvent) {
            animEvent[1]++;
            animEvent[index+1] = animState.getAnimationKey();
            animEvent[index+2] = animState.getAnimationWeight();
            animEvent[index+3] = animState.getAnimationTimeScale();
        };

        EventParser.animationEvent = function(worldEntity) {
            animStates = worldEntity.animationStates;
            animationEvent[0] = ENUMS.Event.UPDATE_ANIMATIONS;
            animationEvent[1] = 0;
            stride = 3;
            for (i = 0; i < animStates.length; i++) {
                addAnimation(animStates[i], stride*i+1, animationEvent);
            }

            return animationEvent;
        };

        return EventParser;
    });

