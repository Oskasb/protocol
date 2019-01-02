"use strict";


define([

    ],
    function(

    ) {


        var EventParser = function() {};


        EventParser.parseEntityEvent = function(modelInstance, event) {

            obj3d = modelInstance.obj3d;

            obj3d.position.x     =  event[0]   ;
            obj3d.position.y     =  event[1]   ;
            obj3d.position.z     =  event[2]   ;
            obj3d.quaternion.x   =  event[3]   ;
            obj3d.quaternion.y   =  event[4]   ;
            obj3d.quaternion.z   =  event[5]   ;
            obj3d.quaternion.w   =  event[6]   ;
            obj3d.scale.x        =  event[7]   ;
            obj3d.scale.y        =  event[8]   ;
            obj3d.scale.z        =  event[9]   ;

            if (modelInstance.active !== event[10]) {
                modelInstance.setActive(event[10]);

            }

        };

        var entityEvent = [];
        var obj3d;

        EventParser.worldEntityEvent = function(worldEntity) {
            obj3d = worldEntity.obj3d;
            entityEvent[0] = obj3d.position.x;
            entityEvent[1] = obj3d.position.y;
            entityEvent[2] = obj3d.position.z;
            entityEvent[3] = obj3d.quaternion.x;
            entityEvent[4] = obj3d.quaternion.y;
            entityEvent[5] = obj3d.quaternion.z;
            entityEvent[6] = obj3d.quaternion.w;
            entityEvent[7] = obj3d.scale.x;
            entityEvent[8] = obj3d.scale.y;
            entityEvent[9] = obj3d.scale.z;
            entityEvent[10] = worldEntity.active;
            return entityEvent;
        };

        return EventParser;
    });

