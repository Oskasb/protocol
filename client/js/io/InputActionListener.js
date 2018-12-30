
define([], function() {

	var inputAction = [0, 0];

	var buttons = {
		RIGHT:'RIGHT',
		LEFT:'LEFT',
		MIDDLE:'MIDDLE'
	};

	var events = {
		touchstart:'touchstart',
		touchend:'touchend',
		touchmove:'touchmove',
		mousedown:'mousedown',
		mouseup:'mouseup',
		mouseout:'mouseout',
		click:'click'
	};

	var InputActionListener = function() {
		this.pressedButtons = [0, 0]
	};

	InputActionListener.prototype.handleElementMouseEvent = function(eventType, button) {
		switch (button) {
			case buttons.RIGHT:

				switch (eventType) {
					case events.mousedown:
						this.pressedButtons[1] = 1;
						inputAction = this.pressedButtons;
						break;
					case events.mouseup:
						this.pressedButtons[1] = 0;
						inputAction = this.pressedButtons;
						break;
					case events.mouseout:
						break;
					case events.click:
						break;
				}

				break;
			case buttons.LEFT:
				switch (eventType) {
					case events.mousedown:
						this.pressedButtons[0] = 1;
						inputAction = this.pressedButtons;
						break;
					case events.mouseup:
						this.pressedButtons[0] = 0;
						inputAction = this.pressedButtons;
						break;
					case events.click:
						break;
				}
				break;
			case buttons.MIDDLE:
				switch (eventType) {
					case events.mousedown:
						inputAction = [1, 1];
						break;
					case events.mouseup:
						inputAction = [0, 0];
						break;
					case events.click:
						break;
				}
				break;
		}
	};

	InputActionListener.prototype.handleMouseEvt = function(evt) {
		var clickType = buttons.LEFT;
		if (evt.which) {
			if (evt.which===3) clickType=buttons.RIGHT;
			if (evt.which===2) clickType=buttons.MIDDLE;
		} else if (evt.button) {
			if (evt.button===2) clickType=buttons.RIGHT;
			if (evt.button===4) clickType=buttons.MIDDLE;
		}
		this.handleElementMouseEvent(evt.type, clickType)
	};

	InputActionListener.prototype.setupElementInputListener = function(element, callUpdate) {

		var handleMouseEvent = function(e) {
			//	e.stopPropagation();
			var evt = (e==null ? event:e);
			this.handleMouseEvt(evt)
			callUpdate();
		}.bind(this);

		var handleTouchStart = function() {
			inputAction[0] = 1;
		};

		var handleTouchEnd = function() {
			inputAction[0] = 0;
		};

		element.addEventListener(events.touchstart, handleTouchStart);
		element.addEventListener(events.touchend, handleTouchEnd);
		element.addEventListener(events.mouseup, handleMouseEvent);
		element.addEventListener(events.click, handleMouseEvent);
		element.addEventListener(events.mousedown, handleMouseEvent);
		element.addEventListener(events.mouseout, handleMouseEvent);

	};

	InputActionListener.prototype.sampleAction = function(inputStore) {
		inputStore.action[0] = inputAction[0];
		inputStore.action[1] = inputAction[1];
	};

	return InputActionListener
});
