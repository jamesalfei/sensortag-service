const EventEmitter = require('events');
const MovingAverage = require('moving-average');

const accelerometerPeriod = 200;
const accelerometerPrecision = 2;
const movingAverageTimeInterval = 2000;
const accelerometerUpdateMinInterval = 100;

const safeCallback = function (callback) {
    if (typeof callback == 'function') {
        callback()
    }
};

class Sensor extends EventEmitter {

    constructor(sensorTag) {
        super();
        this.sensorTag = sensorTag;
        this.hasAddedListeners = false;
        this.hasStarted = false;
        this.leftButtonPressed = false;
        this.rightButtonPressed = false;
        this.addListeners();
        this.accelerometerUpdateTimestamp = 0;
        this.movingAverageX = MovingAverage(movingAverageTimeInterval)
        this.movingAverageY = MovingAverage(movingAverageTimeInterval)
        this.movingAverageZ = MovingAverage(movingAverageTimeInterval)
    }

    getId() {
        return this.sensorTag.uuid;
    }

    addListeners() {
        const _this = this;

        if (this.hasAddedListeners) {
            return;
        }
        this.hasAddedListeners = true;

        this.sensorTag.on('accelerometerChange', (x, y, z) => {
            const timestamp = Date.now();
            this.movingAverageX.push(timestamp, x);
            this.movingAverageY.push(timestamp, y);
            this.movingAverageZ.push(timestamp, z);
            if (timestamp - this.accelerometerUpdateTimestamp > accelerometerUpdateMinInterval) {
                this.accelerometerUpdateTimestamp = timestamp;
                x = this.movingAverageX.movingAverage().toFixed(accelerometerPrecision);
                y = this.movingAverageY.movingAverage().toFixed(accelerometerPrecision);
                z = this.movingAverageZ.movingAverage().toFixed(accelerometerPrecision);
                _this.emit("accelerometerChange", x, y, z);
            }
        });

        this.sensorTag.on('simpleKeyChange', function (left, right, _) {
            if (right) {
                _this.emit("buttonPress");
            }
        });
    }

    start(callback) {
        const _this = this;

        if (this.hasStarted) {
            return;
        }
        this.hasStarted = true;

        this.sensorTag.enableAccelerometer(function (error) {
            console.debug('Sensor.start - set enableAccelerometer');

            if (error) {
                console.error(error);
            }

            _this.sensorTag.setAccelerometerPeriod(accelerometerPeriod, function (error) {
                console.debug('Sensor.start - set accelerometerPeriod');
                if (error) {
                    console.error(error);
                }

                _this.sensorTag.notifyAccelerometer(function (error) {
                    console.log('Sensor.start - set notifyAccelerometer');
                    if (error) {
                        console.error(error);
                    }
                    safeCallback(callback);
                });
            });

            _this.sensorTag.notifySimpleKey(function (error) {
                console.debug('Sensor.start - set notifySimpleKey');
                if (error) {
                    console.error(error);
                }
            });
        });
    }

    stop(callback) {
        this.sensorTag.unnotifyAccelerometer(safeCallback(callback));
    }
}

module.exports = Sensor;