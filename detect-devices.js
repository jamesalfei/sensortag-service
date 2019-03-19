const SensorTag = require('sensortag');

function onDiscover(sensorTag) {
    console.log('Discovered: ' + sensorTag);

    sensorTag.connectAndSetUp(function () {
        console.log('waiting for button press ...');

        sensorTag.on('simpleKeyChange', function (_, _, _) {
            console.log(this.id, this.uuid);
        });

        sensorTag.notifySimpleKey(function (e) {
            console.log('notifySimpleKey.error', e);
        });
    });
}

SensorTag.discoverAll(onDiscover);

setTimeout(function() {
    SensorTag.stopDiscoverAll(onDiscover);
}, 10000);