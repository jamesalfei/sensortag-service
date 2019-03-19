const SensorTag = require('sensortag');
const index = require('../operations');

module.exports = function(app) {
    app.post('/connectToDevices', (req, res) => {
        SensorTag.discoverAll(index.onDiscover);
        res.send("Hello");
    });

    app.get('/device/:id', (req, res) => {
        res.send("SomeData");
    });
};