
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

	InputActionListener.prototype.handleElementMouseEvent = function(eventType, button, inputStore) {
		switch (button) {
			case buttons.RIGHT:

				switch (eventType) {
					case events.mousedown:
						this.pressedButtons[1] = 1;
						break;
					case events.mouseup:
						this.pressedButtons[1] = 0;
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
						break;
					case events.mouseup:
						this.pressedButtons[0] = 0;
						break;
					case events.click:
						break;
				}
				break;
			case buttons.MIDDLE:
				switch (eventType) {
					case events.mousedown:
						this.pressedButtons[0] = 1;
						this.pressedButtons[1] = 1;
						break;
					case events.mouseup:
						this.pressedButtons[0] = 0;
						this.pressedButtons[1] = 0;
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

	InputActionListener.prototype.setupElementInputListener = function(element, callUpdate, pState) {

		var handleMouseEvent = function(e) {
			//	e.stopPropagation();
			var evt = (e==null ? event:e);
			this.handleMouseEvt(evt);
			pState.mouse.action[0] = this.pressedButtons[0];
			pState.mouse.action[1] = this.pressedButtons[1];
			callUpdate(pState.mouse);
		}.bind(this);

		element.addEventListener(events.mouseup, handleMouseEvent);
		element.addEventListener(events.click, handleMouseEvent);
		element.addEventListener(events.mousedown, handleMouseEvent);
		element.addEventListener(events.mouseout, handleMouseEvent);

	};

	return InputActionListener
});
