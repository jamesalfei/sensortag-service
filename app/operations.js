const io = require('socket.io')();
const devices = require('./detect-devices');

exports.disconnectSensors = function() {
    devices.getSensors().forEach(function(sensor) {
        sensor.sensorTag.disconnect(function() {
            console.log('Disconnected');
        });
    });
};

exports.connectSensor = function(deviceID) {
    devices.discoverDevice(deviceID);
};

exports.getDataFromSensors = function(callback) {
    devices.getDataFromSensor(callback);
};

io.on('connection', socket => {
    console.info('Socket client connected');
    socket.emit('test', 'foo');
    devices.updateSensors(socket);
    socket.on('test-send', (msg) => {
        console.log('Socket ping', msg);
        socket.emit('ping', msg)
    });
});

io.listen(3000);
