"use strict";

define([

    ],
    function(

    ) {

        var fetchCallbacks = {};
        var dataStore = {};

        var DataFetcher = function() {};

        var called;
        DataFetcher.fetchConfigData = function(category, key, dataId, callback) {
            called = false;
            if (!fetchCallbacks[category]) {
                fetchCallbacks[category] = {}
                dataStore[category] = {}
            }
            if (!fetchCallbacks[category][key]) {
                fetchCallbacks[category][key] = {};
                dataStore[category][key] = {};
            }


            if (!fetchCallbacks[category][key][dataId]) {
                fetchCallbacks[category][key][dataId] = [];
                dataStore[category][key][dataId] = {};
            } else {

                if (dataStore[category][key][dataId].data) {
                    called = true;
                }

            }

            fetchCallbacks[category][key][dataId].push(callback);
        //    if (!called) {
                postMessage([ENUMS.Message.RELAY_CONFIG_DATA, [category, key, dataId]])
        //    } else {
        //        for (var i = 0; i < fetchCallbacks[category][key][dataId].length; i++) {
        //            fetchCallbacks[category][key][dataId][i](dataId, dataStore[category][key][dataId].data);
        //        }
            //    callback(dataId, dataStore[category][key][dataId].data)
        //    }

        };

        DataFetcher.setConfigData = function(msg) {

            var cat = msg[0];
            var key = msg[1];
            var dataName = msg[2];
            var data = msg[3];

            dataStore[cat][key][dataName].data = data;

                for (var i = 0; i < fetchCallbacks[cat][key][dataName].length; i++) {
                    fetchCallbacks[cat][key][dataName][i](dataName, data);
                }

        };

        return DataFetcher;

    });