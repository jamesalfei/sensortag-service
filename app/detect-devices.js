const io = require('socket.io')();
const SensorTag = require('sensortag');
const Sensor = require('./sensor');
const async = require('async');

const sensors = [];

function updateButton(target, sensor) {
    target.emit('BUTTON_PRESS', sensor.getId());
}

function updateAccelerometerChange(target, sensor, x, y, z) {
    target.emit('ACCELEROMETER_CHANGE', {
        sensorId: sensor.getId(), x, y, z
    });
}

function updateSensors(target) {
    target.emit('UPDATE_SENSORS', sensors.map(sensor => sensor.getId()));
}

function discoverDevice(deviceID) {
    SensorTag.discoverById(deviceID, onDiscover);
}

function getDataFromSensor(outCallback) {
    var accelerometerData;
    var gyroData;

    var sensorTag = sensors[0].sensorTag;

    async.series([
        function(callback) {
            sensorTag.readAccelerometer(function(error, x, y, z) {
                accelerometerData = {
                    x: x,
                    y: y,
                    z: z
                };
                callback();
            });
        },
        function(callback) {
            sensorTag.readGyroscope(function (error, x, y, z) {
                gyroData = {
                    x: x,
                    y: y,
                    z: z
                };
                callback();
            });
        },
        function() {
            outCallback(accelerometerData, gyroData)
        }
    ]);
}

function onDiscover(sensorTag) {
    console.log('onDiscover:', sensorTag.uuid);

    sensorTag.connectAndSetUp(function () {

        console.log('on connectAndSetUp: ', sensorTag.uuid);

        sensorTag.readDeviceName(function (error, deviceName) {
            console.log('Connected to device: ' + deviceName);
        });
        sensorTag.readBatteryLevel(function (error, batteryLevel) {
            console.log('Current battery level: ' + batteryLevel);
        });

        const sensor = new Sensor(sensorTag);
        sensors.push(sensor);
        updateSensors(io);

        sensor.start();

        sensor.on('accelerometerChange', (x, y, z) => {
            console.log('accelerometerChange', "X: " + x, "Y: " + y, "Z: "+ z);
            updateAccelerometerChange(io, sensor, x, y, z);
        });

        sensor.on('buttonPress', () => {
            console.log('buttonPress');
            updateButton(io, sensor);
        });

    });
}

module.exports = {
    getSensors: function() {
        return sensors;
    },
    updateSensors: updateSensors,
    discoverDevice: discoverDevice,
    getDataFromSensor: getDataFromSensor

};