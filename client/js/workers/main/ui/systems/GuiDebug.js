"use strict";

define([

    ],
    function(

    ) {

        var debugElements = [];

        var releaseElems = [];
        var frameDraws = 0;

        var debugText;

        var sprite = {x:8, y:0, z:0.025, w:0.025};
        var scale  = {x:0.2, y:0.2, z:1.0};
        var pos  = {x:0, y:0, z:0.0};
        var rgba = {r:1, g:1, b:1, a:1};


        var debugTxtPos = new THREE.Vector3();

        var GuiDebug = function() {

        };


        var applyElem = function(elem, x, y) {

            debugElements.push(elem);

            elem.setSprite(sprite);
            elem.setScaleVec3(scale);

            rgba.r = Math.sin(elem.index*0.2152)*0.25+0.75;
            rgba.g = Math.cos(elem.index*0.3315)*0.25+0.75;

            rgba.b = Math.random()*0.75+0.25;

            elem.setColorRGBA(rgba);

            pos.x = x;
            pos.y = y;

            elem.setPositionVec3(pos);

            elem.setAttackTime(0.0);
            elem.setReleaseTime(0.2);
            elem.startLifecycleNow();

        };


        var reqElem = function(xx, yy) {

            var elemcb = function(e) {
                applyElem(e, xx, yy);
            };

            GuiAPI.buildBufferElement("UI_ELEMENTS_MAIN", elemcb)
        };


        var drawPointXY = function(x, y) {
            frameDraws++;
            reqElem(x, y);
        };

        var holdIt = false;
        var setupDebugText = function() {
            if (!GuiAPI.getAnchorWidget('bottom_left')) return;
            if (holdIt) return;
            holdIt = true;
            var onReady = function(textBox) {
                debugText = textBox;
                textBox.updateTextContent("Text ready...")
            };

            var onActivate = function(inputIndex, widget) {
                widget.text.clearTextContent()
            };

            var opts = GuiAPI.buildWidgetOptions('debug_text_box', onActivate, false, true, "DEBUG TEXT", 0, 0, 'bottom_left');

            GuiAPI.buildGuiWidget('GuiTextBox', opts, onReady);
        };

        GuiDebug.debugDrawPoint = function(x, y) {
            drawPointXY(x, y);
        };

        GuiDebug.drawRectExtents = function(minVec, maxVec) {
            drawPointXY(minVec.x, minVec.y);
            drawPointXY(maxVec.x, minVec.y);
            drawPointXY(minVec.x, maxVec.y);
            drawPointXY(maxVec.x, maxVec.y);
        };


        GuiDebug.addDebugTextString = function(string) {
            if (!debugText) {
                setupDebugText();
                return;
            }
            debugText.updateTextContent(string)
        };

        var debugControlContainer;
        var debugControlContainer2;

        GuiDebug.setupDebugControlContainer = function() {
            var onReady = function(expcont) {
                debugControlContainer = expcont;
            };

            var opts = GuiAPI.buildWidgetOptions('widget_vertical_container', false, false, false, null, 0, 0, 'top_left');

            GuiAPI.buildGuiWidget('GuiExpandingContainer', opts, onReady);
        };

        GuiDebug.setupDebugControlContainer2 = function() {
            var onReady = function(expcont) {
                debugControlContainer2 = expcont;
            };

            var opts = GuiAPI.buildWidgetOptions('widget_expanding_container', false, false, false, null, 0, 0, 'top_center');

            GuiAPI.buildGuiWidget('GuiExpandingContainer', opts, onReady);
        };

        var addDebugButton = function(text, onActivate, testActive, container) {

            var onReady = function(widget) {
                container.addChildWidgetToContainer(widget.guiWidget);
            };

            var opts = GuiAPI.buildWidgetOptions('button_big_blue', onActivate, testActive, true, text);

            GuiAPI.buildGuiWidget('GuiSimpleButton', opts, onReady);

        };

        var showAnimationState = function(animState, gamePiece) {

            var testActive = function() {
                return gamePiece.getPlayingAnimation(animState.key)
            };

            var onActivate = function() {
            //    if (testActive()) {
                    gamePiece.activatePieceAnimation(animState.key, 1, 0.9+Math.random()*0.1)
            //    }
            };

            addDebugButton(animState.key, onActivate, testActive, debugControlContainer)
        };


        GuiDebug.debugPieceAnimations = function(gamePiece) {

            for (var i = 0; i < gamePiece.worldEntity.animationStates.length; i++) {
                showAnimationState(gamePiece.worldEntity.animationStates[i], gamePiece);
            }
        };


        var showAttachmentButton = function(attachmentJoint, gamePiece) {

            var testActive = function() {
                return gamePiece.getJointActiveAttachment(attachmentJoint.key)
            };

            var onActivate = function() {
                //    if (testActive()) {
                gamePiece.attachWorldEntityToJoint('dummyEntity', attachmentJoint.key)
                //    }
            };

            addDebugButton(attachmentJoint.key, onActivate, testActive, debugControlContainer2)
        };

        GuiDebug.debugPieceAttachmentPoints = function(gamePiece) {

            for (var i = 0; i < gamePiece.worldEntity.attachmentJoints.length; i++) {
                showAttachmentButton(gamePiece.worldEntity.attachmentJoints[i], gamePiece);
            }
        };

        GuiDebug.updateDebugElements = function() {
            frameDraws = 0;

            while (debugElements.length) {
                debugElements.pop().releaseElement();
            }

        };

        return GuiDebug;

    });