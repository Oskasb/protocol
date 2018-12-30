define([
    'EventList',
    'worker/protocol/EventProtocol'

], function(
    eventList,
    EventProtocol
) {

    var events = [];
    var listeners = [];

    var evtStatus = {
        activeListeners:0,
        firedCount:0,
        onceListeners:0,
        addedListeners:0
    };

    var list = function() {
        return eventList;
    };

    var TinyEvent = function(type) {
        this.type = type;
        this.arguments = [];
    };

    TinyEvent.prototype.setArgs = function(args) {
        this.arguments = args;
    };

    var setupEvent = function(event) {

        if (typeof (event) !== 'number') {
            console.log("Old Event: ", event);
            return;
        }

        if (!events[event[0]]) {
            listeners[event[0]] = [];
            events[event[0]] = new TinyEvent(event[0]);
        }
    };

    var generateEvent = function(event, arguments) {
        setupEvent(event);
        setEventArgs(event, arguments);
        return events[event[0]];
    };

    var setEventArgs = function(event, args) {

        if (typeof (event[0]) !== 'number') {
            console.log("Old Event: ", event);
            return;
        }

        events[event[0]].setArgs(args);
    };

    var eventArgs = function(event) {
        return events[event[0]].arguments;
    };

    var dispatchEvent = function(event) {
        for (var i = 0; i < listeners[event[0]].length; i++) {
            listeners[event[0]][i](eventArgs(event));
        }
    };

    var dispatch = function(event, arguments) {
        dispatchEvent(event, generateEvent(event, arguments));
        evtStatus.firedCount++;
    };

    var registerListener = function(event, callback) {
        setupEvent(event);
        listeners[event[0]].push(callback);
    };

    var registerOnceListener = function(event, callback) {
        setupEvent(event);

        var remove = function() {
            removeListener(listeners[event[0]], singleShot);
            evtStatus.onceListeners--;
            if (evtStatus.onceListeners < 0) {
                console.log("overdose singleshots", event);
            }
        };

        var call = function(args) {
            callback(args);
        };

        var singleShot = function(args) {

            call(args);
            remove();

        };

        evtStatus.onceListeners++;

        registerListener(event, singleShot);
    };

    var spliceListener = function(listeners, cb) {
        listeners.splice(listeners.indexOf(cb), 1);
    };

    var getEventSystemStatus = function() {

        evtStatus.eventCount = 0;
        evtStatus.listenerCount = 0;
        for (var key in listeners) {
            evtStatus.eventCount++;
            evtStatus.listenerCount += listeners[key].length;
        }

        return evtStatus;
    };

    var asynchifySplice = function(listnrs, cb) {
        setTimeout(function() {
            spliceListener(listnrs, cb)
        }, 0)
    };

    var removeListener = function(event, callback) {

        if (!listeners[event[0]]) {
            return;
        }

        if (listeners[event[0]].indexOf(callback) === -1) {
            return;
        }

        //  spliceListener(listeners[event[0]], callback);
           asynchifySplice(listeners[event[0]], callback);
    };

    var setEventBuffers = function(buffers, workerIndex) {
        EventProtocol.setEventBuffer(buffers, workerIndex, dispatch)
    };

    var initEventFrame = function(frame) {
        EventProtocol.initEventFrame(frame);
    };



    var fireEvent = function(eventType, argBuffer) {
        EventProtocol.registerBufferEvent(eventType, argBuffer);
    };

    return {
        getEventSystemStatus:getEventSystemStatus,
        removeListener:removeListener,
        on:registerListener,
        once:registerOnceListener,
        args:eventArgs,
        fire:fireEvent,
        list:list,
        setEventBuffers:setEventBuffers,
        initEventFrame:initEventFrame
    };

});