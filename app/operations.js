const io = require('socket.io')();
const Sensor = require('./sensor');
const logger = require('./logger');

const sensors = [];

function updateSensors(target) {
    target.emit('UPDATE_SENSORS', sensors.map(sensor => sensor.getId()));
}

function updateButton(target, sensor) {
    target.emit('BUTTON_PRESS', sensor.getId());
}

function updateAccelerometerChange(target, sensor, x, y, z) {
    target.emit('ACCELEROMETER_CHANGE', {
        sensorId: sensor.getId(), x, y, z
    });
}

exports.onDiscover = function(sensorTag) {
    console.log('onDiscover:', sensorTag.uuid);

    sensorTag.connectAndSetUp(function () {
        logger.info('on connectAndSetUp: ', sensorTag.uuid);

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
            logger.debug('accelerometerChange', x, y, z);
            updateAccelerometerChange(io, sensor, x, y, z);
        });

        sensor.on('buttonPress', () => {
            logger.debug('buttonPress');
            updateButton(io, sensor);
        });

    });
};

io.on('connection', socket => {
    logger.info('Socket client connected');
    socket.emit('test', 'foo');
    updateSensors(socket);
    socket.on('test-send', (msg) => {
        logger.info('Socket ping', msg);
        socket.emit('ping', msg)
    });
});

io.listen(3000);
