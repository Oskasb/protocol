"use strict";

define([

    ],
    function(

    ) {

        var fetchCallbacks = {};

        var DataFetcher = function(element) {};

        DataFetcher.fetchConfigData = function(category, key, dataId, callback) {
            if (!fetchCallbacks[category]) {
                fetchCallbacks[category] = {}
            }
            if (!fetchCallbacks[category][key]) {
                fetchCallbacks[category][key] = {};
            }
            if (!fetchCallbacks[category][key][dataId]) {
                fetchCallbacks[category][key][dataId] = [];
            }

            fetchCallbacks[category][key][dataId].push(callback);
            postMessage([ENUMS.Message.RELAY_CONFIG_DATA, [category, key, dataId]])
        };

        DataFetcher.setConfigData = function(msg) {

            var cat = msg[0];
            var key = msg[1];
            var dataName = msg[2];
            var data = msg[3];

                for (var i = 0; i < fetchCallbacks[cat][key][dataName].length; i++) {
                    fetchCallbacks[cat][key][dataName][i](dataName, data);
                }

        };

        return DataFetcher;

    });