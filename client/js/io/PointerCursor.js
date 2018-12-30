"use strict";

define([
    'PipelineAPI',
		'io/InputState',
		'evt',
		'ui/GameScreen'
	],
	function(
        PipelineAPI,
		InputState,
		evt,
        GameScreen
	) {

        var INPUT_STATE;
        var tempVec = new THREE.Vector3();

        var INPUT_BUFFERS;
        var i;


		var PointerCursor = function() {

			this.inputState = new InputState();

			this.x = 0;
			this.y = 0;

			var pointerState = this.inputState.getPointerState();

			PipelineAPI.setCategoryData('INPUT_STATE', pointerState);

            INPUT_STATE = this.inputState.getPointerState();

            var onInputUpdate = function() {
            	this.tick();
			}.bind(this);

            this.inputState.setupUpdateCallback(onInputUpdate);

		};

        var screenFitXY = function(buffer, x, y, vec) {

            vec.x = (x-buffer[ENUMS.InputState.VIEW_LEFT]) / buffer[ENUMS.InputState.VIEW_WIDTH] - 0.5;
            vec.y = -(y-buffer[ENUMS.InputState.VIEW_TOP]) / buffer[ENUMS.InputState.VIEW_HEIGHT] + 0.5;
            GameScreen.fitView(vec);
		};

        var updateInputBuffer = function(buffer, inputState) {

            buffer[ENUMS.InputState.VIEW_LEFT]         = GameScreen.getLeft();
            buffer[ENUMS.InputState.VIEW_TOP]          = GameScreen.getTop();
            buffer[ENUMS.InputState.VIEW_WIDTH]        = GameScreen.getWidth();
            buffer[ENUMS.InputState.VIEW_HEIGHT]       = GameScreen.getHeight();
            buffer[ENUMS.InputState.ASPECT]            = GameScreen.getAspect();

            screenFitXY(buffer, inputState.x, inputState.y, tempVec);

            buffer[ENUMS.InputState.MOUSE_X]           = tempVec.x ;

            buffer[ENUMS.InputState.MOUSE_Y]           = tempVec.y ;
            buffer[ENUMS.InputState.WHEEL_DELTA]       = inputState.wheelDelta;

            if (inputState.pressFrames === 0) {
                buffer[ENUMS.InputState.START_DRAG_X]      = tempVec.x ;
                buffer[ENUMS.InputState.START_DRAG_Y]      = tempVec.y ;
            }

            buffer[ENUMS.InputState.DRAG_DISTANCE_X]   = buffer[ENUMS.InputState.MOUSE_X] - buffer[ENUMS.InputState.START_DRAG_X];
            buffer[ENUMS.InputState.DRAG_DISTANCE_Y]   = buffer[ENUMS.InputState.MOUSE_Y] - buffer[ENUMS.InputState.START_DRAG_Y];
            buffer[ENUMS.InputState.ACTION_0]          = inputState.action[0];
            buffer[ENUMS.InputState.ACTION_1]          = inputState.action[1];
            buffer[ENUMS.InputState.LAST_ACTION_0]     = inputState.lastAction[0];
            buffer[ENUMS.InputState.LAST_ACTION_1]     = inputState.lastAction[1];
            buffer[ENUMS.InputState.PRESS_FRAMES]      = inputState.pressFrames;
            buffer[ENUMS.InputState.FRUSTUM_FACTOR]    = 0.82;

        };

        var updateBuffers = function(buffers, inputState) {
            for (i = 0; i < buffers.length; i++) {
                updateInputBuffer(buffers[i], inputState)
            }
        };

		PointerCursor.prototype.tick = function() {

		    this.inputState.updateInputState();

            INPUT_BUFFERS = PipelineAPI.getCachedConfigs().BUFFERS[ENUMS.getKey('BufferType', ENUMS.BufferType.INPUT_BUFFER)];

            if (!INPUT_BUFFERS) return;
            updateBuffers(INPUT_BUFFERS, INPUT_STATE.inputState);

		};

		return PointerCursor;
	});