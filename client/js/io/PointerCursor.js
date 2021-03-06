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

            var onInputUpdate = function(pState) {
            	this.updatePointerState(pState);
			}.bind(this);

            this.inputState.setupUpdateCallback(onInputUpdate);



		};

        var screenFitXY = function(buffer, x, y, vec) {


            vec.x = (x-buffer[ENUMS.InputState.VIEW_LEFT + idxOffset]) / buffer[ENUMS.InputState.VIEW_WIDTH + idxOffset] - 0.5;
            vec.y = -(y-buffer[ENUMS.InputState.VIEW_TOP + idxOffset]) / buffer[ENUMS.InputState.VIEW_HEIGHT + idxOffset] + 0.5;
            GameScreen.fitView(vec);
		};

        var updateBufferValue = function(buffer, key, value) {

            let indexKey = key + pointerIndex * ENUMS.InputState.BUFFER_SIZE;

            if (buffer[indexKey] !== value) {
                buffer[indexKey] = value;
                buffer[ENUMS.InputState.HAS_UPDATE + pointerIndex * ENUMS.InputState.BUFFER_SIZE] = 1
        //        console.log("Update input: ", ENUMS.getKey('InputState',key), value)
            }

        };

        var pointerIndex = 0;
        var idxOffset = 0;
        var updateInputBuffer = function(buffer, inputState, inputIndex) {

            pointerIndex = inputIndex;
            idxOffset = pointerIndex * ENUMS.InputState.BUFFER_SIZE;
            buffer[ENUMS.InputState.HAS_UPDATE + idxOffset] = 0;

        //    if (inputIndex === 0) {
                updateBufferValue( buffer, ENUMS.InputState.VIEW_LEFT         , GameScreen.getLeft()       );
                updateBufferValue( buffer, ENUMS.InputState.VIEW_TOP          , GameScreen.getTop()        );
                updateBufferValue( buffer, ENUMS.InputState.VIEW_WIDTH        , GameScreen.getWidth()      );
                updateBufferValue( buffer, ENUMS.InputState.VIEW_HEIGHT       , GameScreen.getHeight()     );
                updateBufferValue( buffer, ENUMS.InputState.ASPECT            , GameScreen.getAspect()     );
        //    }

            screenFitXY(buffer, inputState.x, inputState.y, tempVec);

            updateBufferValue( buffer , ENUMS.InputState.MOUSE_X       ,    tempVec.x                 );
            updateBufferValue( buffer , ENUMS.InputState.MOUSE_Y       ,    tempVec.y                 );
            updateBufferValue( buffer , ENUMS.InputState.WHEEL_DELTA   ,    inputState.wheelDelta     );

            if (inputState.pressFrames === 0) {
                buffer[ENUMS.InputState.HAS_UPDATE  + idxOffset] = 1;
                updateBufferValue( buffer , ENUMS.InputState.START_DRAG_X , tempVec.x ) ;
                updateBufferValue( buffer , ENUMS.InputState.START_DRAG_Y , tempVec.y ) ;
            }

            updateBufferValue(buffer , ENUMS.InputState.DRAG_DISTANCE_X   , buffer[ENUMS.InputState.MOUSE_X + idxOffset] - buffer[ENUMS.InputState.START_DRAG_X + idxOffset]    );
            updateBufferValue(buffer , ENUMS.InputState.DRAG_DISTANCE_Y   , buffer[ENUMS.InputState.MOUSE_Y + idxOffset] - buffer[ENUMS.InputState.START_DRAG_Y + idxOffset]    );
            updateBufferValue(buffer , ENUMS.InputState.ACTION_0          , inputState.action[0]        );
            updateBufferValue(buffer , ENUMS.InputState.ACTION_1          , inputState.action[1]        );
            updateBufferValue(buffer , ENUMS.InputState.LAST_ACTION_0     , inputState.lastAction[0]    );
            updateBufferValue(buffer , ENUMS.InputState.LAST_ACTION_1     , inputState.lastAction[1]    );
            updateBufferValue(buffer , ENUMS.InputState.PRESS_FRAMES      , inputState.pressFrames      );
            updateBufferValue(buffer , ENUMS.InputState.FRUSTUM_FACTOR    , 0.82                  );

        };


		PointerCursor.prototype.updatePointerState = function(pointerState) {

		    this.inputState.updateInputState(pointerState);

            INPUT_BUFFERS = PipelineAPI.getCachedConfigs().BUFFERS[ENUMS.getKey('BufferType', ENUMS.BufferType.INPUT_BUFFER)];

            if (!INPUT_BUFFERS) return;
            updateInputBuffer(INPUT_BUFFERS[0], pointerState, pointerState.index);

		};

		return PointerCursor;
	});