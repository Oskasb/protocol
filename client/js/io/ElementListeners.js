"use strict";

define([
		'ui/GameScreen',
		'io/InputActionListener'
	],
	function(
		GameScreen,
		InputActionListener
	) {

		var x = 0;
		var y = 0;
		var dx = 0;
		var dy = 0;
		var wheelDelta = 0;
		var inputState;

		var inputUpdateCallbacks = [];

		var callInputUpdate = function() {

			for (var i = 0; i < inputUpdateCallbacks.length; i++) {
				inputUpdateCallbacks[i]();
			}
		};

		var ElementListeners = function(inpState, ) {
			inputState = inpState;
			this.actionListener = new InputActionListener();
			this.setupInputListener();

		};

		ElementListeners.prototype.setupInputListener = function() {

			this.actionListener.setupElementInputListener(GameScreen.getElement(), callInputUpdate);

			GameScreen.getElement().addEventListener('mousemove', function(e) {
				//	e.stopPropagation();
				x = (e.clientX);
				y = (e.clientY);
				dx = 2 * ((x) - GameScreen.getWidth() / 2) / GameScreen.getWidth();
				dy = 2 * ((y) - GameScreen.getHeight() / 2) / GameScreen.getHeight();
				callInputUpdate();
			});

			GameScreen.getElement().addEventListener('mouseout', function(e) {
				//	e.stopPropagation();
				dx = 0;
				dy = 0;
				callInputUpdate();
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
				callInputUpdate();
			});

			GameScreen.getElement().addEventListener('touchstart', function(e) {
				//	e.preventDefault();
				x = (e.touches[0].clientX);
				y = (e.touches[0].clientY);
				dx = 0;
				dy = 0;
				callInputUpdate();
			});

			GameScreen.getElement().addEventListener('touchmove', function(e) {
				//	e.preventDefault();
				x = (e.touches[0].clientX);
				y = (e.touches[0].clientY);
				dx = 2 * ((x) - GameScreen.getWidth() / 2) / GameScreen.getWidth();
				dy = 2 * ((y) - GameScreen.getHeight() / 2) / GameScreen.getHeight();
				callInputUpdate();
			});

			GameScreen.getElement().addEventListener('touchend', function(e) {
				//	e.preventDefault();
				dx = 0;
				dy = 0;
				callInputUpdate();
			});
		};

		ElementListeners.prototype.sampleMouseState = function() {

			if (inputState.action[0]) {
				inputState.pressFrames++;
			} else {
				inputState.pressFrames = 0;
			}

			inputState.action[0] = 0;
			inputState.action[1] = 0;
			this.actionListener.sampleAction(inputState);

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