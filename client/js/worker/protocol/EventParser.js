"use strict";


define([

    ],
    function(

    ) {

        var animationEvent = [];
        var attachmentPointEvent = [];
        var key;
        var i;
        var animStates;
        var modelEvent = [];
        var obj3d;
        var count;
        var stride;
        var spatial;

        var EventParser = function() {};

        var parser = [];
        parser[ENUMS.Event.UPDATE_MODEL] = function(modelInstance, event) {
            obj3d = modelInstance.obj3d;

            spatial = modelInstance.getSpatial();
            spatial.setPosXYZ(   event[1],  event[2],  event[3]  );
            spatial.setQuatXYZW( event[4],  event[5],  event[6],  event[7] );
            spatial.setScaleXYZ( event[8],  event[9],  event[10] );


            if (modelInstance.active !== event[11]) {
                modelInstance.setActive(event[11]);
            }
        };

        var readAnimation = function(modelInstance, index, animEvent) {
            modelInstance.updateAnimationState(
                animEvent[index+1],
                animEvent[index+2],
                animEvent[index+3],
                animEvent[index+4],
                animEvent[index+5]
            )
        };

        var animStride = 5;
        var attachStride = 12;

        parser[ENUMS.Event.UPDATE_ANIMATIONS] = function(modelInstance, event) {
            count = event[1];
            stride = animStride;
            for (i = 0; i < count; i++) {
                readAnimation(modelInstance, stride*i+1, event);
            }
        };



        parser[ENUMS.Event.ATTACH_TO_JOINT] = function(modelInstance, event) {

            console.log("Parse ATTACH_TO_JOINT", modelInstance, event);

        };





        parser[ENUMS.Event.ATTACH] = function(modelInstance, event) {
            modelInstance.requestAttachment(event[1])
        };




        EventParser.parseEntityEvent = function(modelInstance, event) {
            if (!parser[event[0]]) {
                console.log("Bad event: ", [modelInstance, event]);
                return;
            }
            parser[event[0]](modelInstance, event);
        };

        EventParser.worldEntityEvent = function(worldEntity) {

            obj3d = worldEntity.obj3d;
            modelEvent[0]  = ENUMS.Event.UPDATE_MODEL;
            modelEvent[1]  = obj3d.position.x;
            modelEvent[2]  = obj3d.position.y;
            modelEvent[3]  = obj3d.position.z;
            modelEvent[4]  = obj3d.quaternion.x;
            modelEvent[5]  = obj3d.quaternion.y;
            modelEvent[6]  = obj3d.quaternion.z;
            modelEvent[7]  = obj3d.quaternion.w;
            modelEvent[8]  = obj3d.scale.x;
            modelEvent[9]  = obj3d.scale.y;
            modelEvent[10] = obj3d.scale.z;
            modelEvent[11] = worldEntity.active;
            return modelEvent;
        };

        var addAnimation = function(animState, index, animEvent) {
            animEvent[1]++;
            animEvent[index+1] = ENUMS.Animations[animState.getAnimationKey()];
            animEvent[index+2] = animState.getAnimationWeight();
            animEvent[index+3] = animState.getAnimationTimeScale();
            animEvent[index+4] = animState.getAnimationFade();
            animEvent[index+5] = animState.getAnimationChannel();
        };

        var idx;
        EventParser.animationEvent = function(worldEntity) {
            animStates = worldEntity.animationStates;
            animationEvent[0] = ENUMS.Event.UPDATE_ANIMATIONS;
            animationEvent[1] = 0;
            stride = animStride;
            idx = 0;
            for (i = 0; i < animStates.length; i++) {
                if (animStates[i].isDirty) {
                    addAnimation(animStates[i], stride*idx+1, animationEvent);
                    animStates[i].isDirty = false;
                    idx++;
                }
            }

            return animationEvent;
        };


        var attachedEntity;
        var addAttachmentJoint = function(joint, index, attchEvent) {
            obj3d = joint.obj3d;
            attachedEntity = joint.getAttachedEntity();
            attchEvent[1]++;
            attchEvent[index+1]  = ENUMS.Joints[joint.getJointKey()];
            attchEvent[index+2]  = obj3d.position.x;
            attchEvent[index+3]  = obj3d.position.y;
            attchEvent[index+4]  = obj3d.position.z;
            attchEvent[index+5]  = obj3d.quaternion.x;
            attchEvent[index+6]  = obj3d.quaternion.y;
            attchEvent[index+7]  = obj3d.quaternion.z;
            attchEvent[index+8]  = obj3d.quaternion.w;
            attchEvent[index+9]  = obj3d.scale.x;
            attchEvent[index+10] = obj3d.scale.y;
            attchEvent[index+11] = obj3d.scale.z;

            if (attachedEntity) {
                attchEvent[index+12] = attachedEntity.ptr;
            } else {
                attchEvent[index+12] = -1;
            }

        };

        var attJoints;

        EventParser.attachmentPointEvent = function(worldEntity) {

            attJoints = worldEntity.attachmentJoints;

            attachmentPointEvent[0] = ENUMS.Event.ATTACH_TO_JOINT;

            attachmentPointEvent[1] = 0;
            stride = attachStride;
            idx = 0;

            for (i = 0; i < attJoints.length; i++) {
                if (attJoints[i].isDirty) {
                    addAttachmentJoint(attJoints[i], stride*idx+1, attachmentPointEvent);
                    attJoints[i].isDirty = false;
                    idx++;
                }
            }

            return attachmentPointEvent;

        };

        EventParser.attachmentEvent = function(hostEntity, itemEntity) {
            animationEvent[0] = ENUMS.Event.ATTACH;
            animationEvent[1] = itemEntity.ptr;
            return animationEvent;
        };

        return EventParser;
    });

