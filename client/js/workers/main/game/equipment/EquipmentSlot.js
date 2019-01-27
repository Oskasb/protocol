"use strict";

define([

    ],
    function(

    ) {

    var itemTypeSlotMap = {};
        itemTypeSlotMap['HELMET']      = "SLOT_HEAD"    ;
        itemTypeSlotMap['SHIRT']       = "SLOT_BODY"    ;
        itemTypeSlotMap['CHESTPLATE']  = "SLOT_CHEST"   ;
        itemTypeSlotMap['MAILARMOR']   = "SLOT_CHEST"   ;
        itemTypeSlotMap['BRACER']      = "SLOT_WRIST"   ;
        itemTypeSlotMap['GLOVES']      = "SLOT_HANDS"   ;
        itemTypeSlotMap['BELT']        = "SLOT_WAIST"   ;
        itemTypeSlotMap['LEGGINGS']    = "SLOT_LEGS"    ;
        itemTypeSlotMap['SKIRT']       = "SLOT_SKIRT"   ;
        itemTypeSlotMap['GREAVES']     = "SLOT_GREAVES" ;
        itemTypeSlotMap['BOOTS']       = "SLOT_FEET"    ;
        itemTypeSlotMap['SWORD']       = "SLOT_HAND_R"  ;
        itemTypeSlotMap['SWORD']       = "SLOT_HAND_L"  ;


        var EquipmentSlot = function(slotId, joint) {
            this.slotId = slotId;
            this.joint = joint;
            console.log("new Slot", slotId, joint);
        };

        EquipmentSlot.prototype.initEquipmentSlots = function( dataId, workerData, onReady) {

            this.workerData = workerData;

            var onDataReady = function(isUpdate) {
                if (!isUpdate) {
                    onReady(this);
                }
            }.bind(this);

            workerData.fetchData(dataId, onDataReady);
        };

        EquipmentSlot.prototype.readConfigData = function(key) {
            return this.workerData.readDataKey(key)
        };

        EquipmentSlot.prototype.isSuitableForItem = function(item) {

            if (itemTypeSlotMap[item.itemType] === this.slotId) {
                return true
            }

        };



        return EquipmentSlot;


    });

