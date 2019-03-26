const index = require('../operations');
const devices = require('../detect-devices');

//POST up to endpoint
//CONNECT to sensor
//GET historic data
//DISCONNECT from sensor

module.exports = function(app) {
    app.post('/start', (req, res) => {
        index.connectSensor("5fbb37b58ad14d25babfbf6b66cdb40c");
        res.send("Connecting to FlyingLow sensor...");
    });

    app.post('/stop', (req, res) => {
        index.disconnectSensors();
        res.send("Disconnected from SensorTag");
    });

    app.post('/record', (req, res) => {
        console.log('Recording Start');
        res.send("Recording Start");
    });

    app.post('/recordStop', (req, res) => {
        console.log('Recording stopped');
        res.send("Recording stopped");
    });



    app.get('/data', (req, res) => {
        index.getDataFromSensors(function (accelerometer, gyro) {
            const data = {
                accelerometer: accelerometer,
                gyro: gyro
            };
            res.send(data);
        });
    });
};