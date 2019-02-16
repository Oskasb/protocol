define([
    'EventList',
    'worker/protocol/EventProtocol',
    'worker/protocol/EventParser'

], function(
    eventList,
    EventProtocol,
    EventParser
) {

    var events = [];
    var listeners = [];

    var spliceListeners = [];

    var evtStatus = {
        activeListeners:0,
        firedCount:0,
        onceListeners:0,
        addedListeners:0
    };

    var list = function() {
        return eventList;
    };

    var setupEvent = function(event) {

        if (typeof (event) !== 'number') {
            console.log("Old Event: ", event);
            return;
        }

        if (!listeners[event]) {
            listeners[event] = [];
        }
    };


    var dispatchEvent = function(event, args) {

        while (spliceListeners.length) {
            spliceListener(spliceListeners.shift(), spliceListeners.shift())
        }

        for (var i = 0; i < listeners[event].length; i++) {

            if (typeof (listeners[event][i]) !== 'function') {
                console.log("Bad listener", event, listeners);
                return;
            }

            listeners[event][i](args);
        }

        while (spliceListeners.length) {
            spliceListener(spliceListeners.shift(), spliceListeners.shift())
        }

    };



    var dispatch = function(event, arguments) {


        if (typeof(listeners[event]) === 'undefined') {

            return;
            // listeners[event] = []
        }

        dispatchEvent(event, arguments);
        evtStatus.firedCount++;
    };

    var registerListener = function(event, callback) {
        setupEvent(event);
        listeners[event].push(callback);
    };

    var registerOnceListener = function(event, callback) {
        setupEvent(event);

        var remove = function() {
            removeListener(listeners[event], singleShot);
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
         MATH.quickSplice(listeners, cb);
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
        spliceListeners.push(listnrs);
        spliceListeners.push(cb);
    };

    var removeListener = function(event, callback) {

        if (!listeners[event]) {
            return;
        }

        if (listeners[event].indexOf(callback) === -1) {
            return;
        }

        //     spliceListener(listeners[event], callback);
        asynchifySplice(listeners[event], callback);
    };

    var setEventBuffers = function(buffers, workerIndex) {
        EventProtocol.setEventBuffer(buffers, workerIndex, dispatch)
    };

    var initEventFrame = function(frame) {
        EventProtocol.initEventFrame(frame);
    };

    var setEventBufferVec3 = function(evtBuffer, startIndex, vec3) {
        evtBuffer[startIndex+1] = vec3.x;
        evtBuffer[startIndex+3] = vec3.y;
        evtBuffer[startIndex+5] = vec3.z;
    };

    var setEventBufferQuat = function(evtBuffer, startIndex, quat) {
        evtBuffer[startIndex+1] = quat.x;
        evtBuffer[startIndex+3] = quat.y;
        evtBuffer[startIndex+5] = quat.z;
        evtBuffer[startIndex+7] = quat.w;
    };

    var getEventBufferVec3 = function(evtBuffer, startIndex, vec3) {
        vec3.x = evtBuffer[startIndex+1];
        vec3.y = evtBuffer[startIndex+3];
        vec3.z = evtBuffer[startIndex+5];
    };

    var getEventBufferQuat = function(evtBuffer, startIndex, quat) {
        quat.x = evtBuffer[startIndex+1] ;
        quat.y = evtBuffer[startIndex+3] ;
        quat.z = evtBuffer[startIndex+5] ;
        quat.w = evtBuffer[startIndex+7] ;
    };

    var fireEvent = function(eventType, argBuffer) {
        EventProtocol.registerBufferEvent(eventType, argBuffer);
    };



    return {
        setArgVec3:setEventBufferVec3,
        setArgQuat:setEventBufferQuat,
        getArgVec3:getEventBufferVec3,
        getArgQuat:getEventBufferQuat,
        getEventSystemStatus:getEventSystemStatus,
        removeListener:removeListener,
        on:registerListener,
        once:registerOnceListener,
        fire:fireEvent,
        list:list,
        setEventBuffers:setEventBuffers,
        initEventFrame:initEventFrame,
        parser:EventParser
    };

});