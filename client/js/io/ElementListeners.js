"use strict";

define([
		'ui/GameScreen',
		'io/InputActionListener'
	],
	function(
		GameScreen,
		InputActionListener
	) {

		var i;
		var x = 0;
		var y = 0;
		var dx = 0;
		var dy = 0;
		var wheelDelta = 0;
		var POINTER_STATE;
		var inputUpdateCallbacks = [];

		var callInputUpdate = function(pState) {

			for (i = 0; i < inputUpdateCallbacks.length; i++) {
				inputUpdateCallbacks[i](pState);
			}
		};

		var ElementListeners = function(P_STATE) {
			POINTER_STATE = P_STATE;
			this.actionListener = new InputActionListener();
			this.setupInputListener();

		};

		ElementListeners.prototype.setupInputListener = function() {

			this.actionListener.setupElementInputListener(GameScreen.getElement(), callInputUpdate, POINTER_STATE);

			GameScreen.getElement().addEventListener('mousemove', function(e) {
				//	e.stopPropagation();
				x = (e.clientX);
				y = (e.clientY);
				dx = 2 * ((x) - GameScreen.getWidth() / 2) / GameScreen.getWidth();
				dy = 2 * ((y) - GameScreen.getHeight() / 2) / GameScreen.getHeight();
				callInputUpdate(POINTER_STATE.mouse);
			});

			GameScreen.getElement().addEventListener('mouseout', function(e) {
				//	e.stopPropagation();
				dx = 0;
				dy = 0;
				callInputUpdate(POINTER_STATE.mouse);
			});

			var zoomTimeout;

			GameScreen.getElement().addEventListener('mousewheel', function(e) {
				//	e.stopPropagation();
				if (zoomTimeout) return;
				wheelDelta = e.wheelDelta / 1200;
				setTimeout(function() {
					zoomTimeout = false;
				}, 100);
				zoomTimeout = true;
				POINTER_STATE.mouse.wheelDelta = wheelDelta;
				callInputUpdate(POINTER_STATE.mouse);
			});

			GameScreen.getElement().addEventListener('touchstart', function(e) {
				//	e.preventDefault();

				for (i = 0; i < e.touches.length; i++) {
					x = (e.touches[i].clientX);
					y = (e.touches[i].clientY);
					dx = 0;
					dy = 0;

					POINTER_STATE.touches[i].action[0] = 1;
					callInputUpdate(POINTER_STATE.touches[i]);
				}

			});

			GameScreen.getElement().addEventListener('touchmove', function(e) {
				//	e.preventDefault();
				for (i = 0; i < e.touches.length; i++) {
					x = (e.touches[0].clientX);
					y = (e.touches[0].clientY);
					dx = 2 * ((x) - GameScreen.getWidth() / 2) / GameScreen.getWidth();
					dy = 2 * ((y) - GameScreen.getHeight() / 2) / GameScreen.getHeight();
					callInputUpdate(POINTER_STATE.touches[i]);
				}
			});

			GameScreen.getElement().addEventListener('touchend', function(e) {
				//	e.preventDefault();
				for (i = 0; i < e.touches.length; i++) {
					dx = 0;
					dy = 0;
					POINTER_STATE.touches[i].action[0] = 0;
					callInputUpdate(POINTER_STATE.touches[i]);
				}
			});

			window.addEventListener('resize', function() {
					callInputUpdate(POINTER_STATE.mouse);
			});
		};

		ElementListeners.prototype.sampleMouseState = function(inputState) {

			if (inputState.action[0]) {
				inputState.pressFrames++;
			} else {
				inputState.pressFrames = 0;
			}

			inputState.x = x;
			inputState.y = y;
			inputState.dx = dx;
			inputState.dy = dy;
			inputState.wheelDelta = wheelDelta;

			wheelDelta = 0;
			dx = 0;
			dy = 0;
		};

		ElementListeners.prototype.attachUpdateCallback = function(callback) {
			inputUpdateCallbacks.push(callback);
		};

		return ElementListeners;

	});