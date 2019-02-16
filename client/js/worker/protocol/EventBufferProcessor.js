"use strict";

define([
        'evt'
    ],
    function(
        evt
    ) {

    var i;
    var bi;
    var key;

    var type;

    var argLength;
    var eventIndex = 0;
    var eventLength = 0;
    var nextWriteIndex = 0;
    var nextReadIndex = 0;
    var packetLength = 0;
    var workerBaseIndex = 0;
    var writeWorkerBaseIndex = 0;

    // var eventBuffer = ['eventLength', 'eventType', 'arg0', 'value0', 'arg1', 'value1', 'arg2', 'value2', 'arg3', 'value3']
        var frameActiveResponses = []
        var responseBuffers = [];
        var response;

    var workerMessageCount = 0;

        var EventBufferProcessor = function() {};

        var initWriteFrame = function() {
            nextWriteIndex = writeWorkerBaseIndex;
        };

        var key;
        var refreshResponseStore = function() {

        };

        var getResponseStore = function(eventLength) {
            if (!responseBuffers[eventLength]) {
                responseBuffers[eventLength] = [];
            }

            return responseBuffers[eventLength];
        };


        var dispatch;

        EventBufferProcessor.registerWorkerIndex = function(wIndex, dispatchFunction) {
            dispatch = dispatchFunction;
            writeWorkerBaseIndex = wIndex * ENUMS.Numbers.event_buffer_size_per_worker;
            initWriteFrame()
        };


        var addEventToBuffer = function(type, argBuffer, buffer) {

            argLength = argBuffer.length;
            nextWriteIndex++;
            buffer[nextWriteIndex] = argLength;
            nextWriteIndex++;
            buffer[nextWriteIndex] = type;

            for (i = 0; i < argLength; i++) {
                nextWriteIndex++;
                buffer[nextWriteIndex] = argBuffer[i];
            //    console.log("Add Arg", workerBaseIndex+nextWriteIndex, buffer[workerBaseIndex+nextWriteIndex] )
            }

            buffer[workerBaseIndex]++;
        };

        EventBufferProcessor.writeBufferEvent = function(workerIndex, type, event, buffer) {
            workerBaseIndex = workerIndex * ENUMS.Numbers.event_buffer_size_per_worker;
            addEventToBuffer(type, event, buffer)
        };

        var readBufferEventAtIndex = function(eventIndex, eventLength, buffer) {

            type = buffer[eventIndex];

            response = getResponseStore(eventLength);

            for (bi = 0; bi < eventLength; bi++) {
                eventIndex++;
                response[bi] = buffer[eventIndex]
            }

            dispatch(type, response)

        };

        var msg;

        var processWorkerBufferFrom = function(baseIndex, buffer, messageCount) {

            eventIndex = baseIndex+1;

            for (msg = 0; msg < messageCount; msg++) {
                eventLength = buffer[eventIndex];
                eventIndex++;

                readBufferEventAtIndex(eventIndex, eventLength, buffer);
                eventIndex+=eventLength+1
            }

        };


        EventBufferProcessor.readBufferEvents = function(buffer) {
            refreshResponseStore();
            for (key in ENUMS.Worker) {
                workerBaseIndex = ENUMS.Worker[key] * ENUMS.Numbers.event_buffer_size_per_worker;
                workerMessageCount = buffer[workerBaseIndex];


                if (workerMessageCount) {
                    processWorkerBufferFrom(workerBaseIndex, buffer, workerMessageCount)
                }
            }
        };

        EventBufferProcessor.initWriteBufferFrame = function(workerIndex, buffer) {
            workerBaseIndex = workerIndex * ENUMS.Numbers.event_buffer_size_per_worker;

            initWriteFrame();

            if (writeWorkerBaseIndex === ENUMS.Worker.MAIN_WORKER * ENUMS.Numbers.event_buffer_size_per_worker) {

                for (key in ENUMS.Worker) {
                    workerBaseIndex = ENUMS.Worker[key] * ENUMS.Numbers.event_buffer_size_per_worker;
                    buffer[workerBaseIndex] = 0;
                }
            }

        };


        EventBufferProcessor.monitorEventBufferProcessor = function() {
            DebugAPI.trackStat('message_count', workerMessageCount);

        };

        return EventBufferProcessor;
    });

