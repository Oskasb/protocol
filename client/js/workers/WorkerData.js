"use strict";



define([

    ],
    function(

    ) {


        var WorkerData = function(configId, configKey) {
            this.configId = configId;
            this.configKey = configKey;
            this.data = {};
            this.dataReady = false;
        };


        WorkerData.prototype.fetchData = function(dataId, onDataLoaded) {

            var dataUpdate = function(src, data) {

                for (var key in data) {
                    this.data[key] = data[key];
                }

                this.dataReady = true;
                onDataLoaded();

            }.bind(this);

            MainWorldAPI.fetchConfigData(this.configId, this.configKey, dataId, dataUpdate);
        };

        WorkerData.prototype.readDataKey = function(dataKey) {
            return this.data[dataKey];
        };


        return WorkerData;
    });

