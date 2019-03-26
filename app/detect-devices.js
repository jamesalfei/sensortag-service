const io = require('socket.io')();
const SensorTag = require('sensortag');
const Sensor = require('./sensor');
const async = require('async');
const sprintf = require("sprintf-js").sprintf;

const sensors = [];

function updateButton(target, sensor) {
    target.emit('BUTTON_PRESS', sensor.getId());
}

function updateAccelerometerChange(target, sensor, x, y, z) {
    target.emit('ACCELEROMETER_CHANGE', {
        sensorId: sensor.getId(), x, y, z
    });
}

function updateGyroChange(target, sensor, x, y, z) {
    target.emit('GYRO_CHANGE', {
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
    let accelerometerData;
    let gyroData;

    const sensorTag = sensors[0];
    async.series([
        function (callback) {
            accelerometerData = {
                x: sensorTag.movingAverageX.movingAverage().toFixed(sensorTag.getPrecision()),
                y: sensorTag.movingAverageY.movingAverage().toFixed(sensorTag.getPrecision()),
                z: sensorTag.movingAverageZ.movingAverage().toFixed(sensorTag.getPrecision())
            };
            callback();
        },
        function (callback) {
            gyroData = {
                x: sensorTag.movingAverageXGyro.movingAverage().toFixed(sensorTag.getPrecision()),
                y: sensorTag.movingAverageYGyro.movingAverage().toFixed(sensorTag.getPrecision()),
                z: sensorTag.movingAverageZGyro.movingAverage().toFixed(sensorTag.getPrecision())
            };
            callback();
        },
        function () {
            outCallback(accelerometerData, gyroData)
        }
    ]);
}

function onDiscover(sensorTag) {
    console.log('onDiscover:', sensorTag.uuid);

    sensorTag.connectAndSetUp(function () {

        console.log('on connectAndSetUp: ', sensorTag.uuid);

        sensorTag.readBatteryLevel(function (error, batteryLevel) {
            console.log('Current battery level: ' + batteryLevel);
        });

        const sensor = new Sensor(sensorTag);
        sensors.push(sensor);
        updateSensors(io);

        sensor.start();

        sensor.on('accelerometerChange', (x, y, z) => {
            console.log(sprintf("Accel => X: %1s Y: %2s Z: %3s", x, y, z));
            updateAccelerometerChange(io, sensor, x, y, z);
        });

        sensor.on('gyroscopeChange', (x, y, z) => {
            console.log(sprintf("Gyro  => X: %1s Y: %2s Z: %3s", x, y, z));
            updateGyroChange(io, sensor, x, y, z);
        });

        sensor.on('buttonPress', () => {
            console.log('buttonPress');
            updateButton(io, sensor);
        });
    });
}

module.exports = {
    getSensors: function () {
        return sensors;
    },
    updateSensors: updateSensors,
    discoverDevice: discoverDevice,
    getDataFromSensor: getDataFromSensor
};