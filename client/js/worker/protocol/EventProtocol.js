"use strict";


define([
        'worker/protocol/EventBufferProcessor'
    ],
    function(
        EventBufferProcessor
    ) {

        var eventBuffers;
        var workerIndex;
        var writeBufferIndex = 0;
        var readBufferIndex = 1;

        var EventProtocol = function() {};

        var getWriteBuffer = function() {
            if (!eventBuffers) {
                console.log("No eventBuffer", workerIndex);
            }
            return eventBuffers[writeBufferIndex]
        };

        var getReadBuffer = function() {
            if (!eventBuffers) {
                console.log("No eventBuffer", workerIndex);
            }
            return eventBuffers[readBufferIndex]
        };

        EventProtocol.setEventBuffer = function(buffers, wIndex, dispatch) {
            workerIndex = wIndex;
            eventBuffers = buffers;
            EventBufferProcessor.registerWorkerIndex(wIndex, dispatch)
        };

        EventProtocol.getEventBuffer = function(index) {
            return eventBuffers[index];
        };

        EventProtocol.registerBufferEvent = function(eventType, eventArgs) {
            EventBufferProcessor.writeBufferEvent(workerIndex, eventType, eventArgs, getWriteBuffer())
        };

        EventProtocol.initEventFrame = function(frame) {
            writeBufferIndex = (frame+1) % eventBuffers.length;
            readBufferIndex = (frame) % eventBuffers.length;
            EventBufferProcessor.readBufferEvents(getReadBuffer());
            EventBufferProcessor.initWriteBufferFrame(workerIndex, getWriteBuffer())
        };

        return EventProtocol;
    });

