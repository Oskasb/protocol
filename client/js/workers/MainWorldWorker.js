var baseUrl = './../../../';


var window = self;
var postMessage = self.postMessage;
var WorkerPort;

var premauteMessageQueue = [];

importScripts(baseUrl+'client/js/ENUMS.js');
importScripts(baseUrl+'client/js/MATH.js');
importScripts(baseUrl+'client/js/lib/three.js');

importScripts(baseUrl+'client/js/lib/three/OBJLoader.js');
importScripts(baseUrl+'client/js/worker/terrain/ServerTerrain.js');
importScripts(baseUrl+'client/js/lib/require.js');



require.config({
    baseUrl: baseUrl,
    paths: {
        data_pipeline:'client/js/lib/data_pipeline/src',
        ThreeAPI:'client/js/3d/three/ThreeWorkerAPI',
        EffectsAPI:'client/js/3d/effects/EffectsAPI',
        PipelineAPI:'client/js/io/PipelineAPI',
        PipelineObject:'client/js/PipelineObject',
        ConfigObject:'client/js/ConfigObject',
        evt:'client/js/evt',
        EventList:'client/js/EventList',
        worker:'client/js/worker',
        workers:'client/js/workers',
        three:'client/js/3d/three',
        GuiAPI:'client/js/worker/ui/GuiAPI',
        ui:'client/js/worker/ui',
        "3d":'client/js/3d',
        game:'client/js/game',
        application:'client/js/application'
    }
});

require([
        'evt',
        'client/js/workers/main/MainWorldAPI'
    ],
    function(
    evt,
    mwAPI
    ) {

        var count = 0;

        MainWorldAPI = mwAPI;

        MainWorldAPI.initMainWorld(ENUMS.Worker.MAIN_WORKER);

        var handleMessage = function(e) {
            count++;
            MainWorldAPI.processMessage(e);
        };

        WorkerPort.onmessage = function(e) {
            handleMessage(e);
        };

        while (premauteMessageQueue.length) {
            handleMessage(premauteMessageQueue.pop());
        //    postMessage(["MainWorldWorker Premature Queue Flush "+count])
        }

    }
);

onmessage = function(e){
    var port = e.ports[0];

    if (!port) return;

    console.log("MainWorldWorker Worker connected");
    WorkerPort = port;

    postMessage = function(msg) {
        WorkerPort.postMessage(msg);
    };

    WorkerPort.onmessage = function(e) {
        premauteMessageQueue.push(e);
    };
};

var mapEnums = function() {
    var map = {};

    for (var key in ENUMS) {
        map[key] = [];

        for (var i in ENUMS[key]) {
            map[key][ENUMS[key][i]] = i;
        }
    }

    ENUMS.Map = map;

    ENUMS.getKey = function(category, index) {
        return ENUMS.Map[category][index];
    }
};

mapEnums();