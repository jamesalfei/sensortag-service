const EventEmitter = require('events');
const MovingAverage = require('moving-average');

const accelerometerPeriod = 200;
const accelerometerPrecision = 2;
const movingAverageTimeInterval = 2000;
const sensorUpdatePeriod= 1000;

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
        this.gyroUpdateTimestamp = 0;
        this.movingAverageX = MovingAverage(movingAverageTimeInterval);
        this.movingAverageY = MovingAverage(movingAverageTimeInterval);
        this.movingAverageZ = MovingAverage(movingAverageTimeInterval);
        this.movingAverageXGyro = MovingAverage(movingAverageTimeInterval);
        this.movingAverageYGyro = MovingAverage(movingAverageTimeInterval);
        this.movingAverageZGyro = MovingAverage(movingAverageTimeInterval);
    }

    getId() {
        return this.sensorTag.uuid;
    }

    getPrecision() {
        return accelerometerPrecision;
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
            if (timestamp - this.accelerometerUpdateTimestamp > sensorUpdatePeriod) {
                this.accelerometerUpdateTimestamp = timestamp;
                x = this.movingAverageX.movingAverage().toFixed(accelerometerPrecision);
                y = this.movingAverageY.movingAverage().toFixed(accelerometerPrecision);
                z = this.movingAverageZ.movingAverage().toFixed(accelerometerPrecision);
                _this.emit("accelerometerChange", x, y, z);
            }
        });

        this.sensorTag.on('gyroscopeChange', (x, y, z) => {
            const timestamp = Date.now();
            this.movingAverageXGyro.push(timestamp, x);
            this.movingAverageYGyro.push(timestamp, y);
            this.movingAverageZGyro.push(timestamp, z);
            if (timestamp - this.gyroUpdateTimestamp > sensorUpdatePeriod) {
                this.gyroUpdateTimestamp = timestamp;
                x = this.movingAverageXGyro.movingAverage().toFixed(accelerometerPrecision);
                y = this.movingAverageYGyro.movingAverage().toFixed(accelerometerPrecision);
                z = this.movingAverageZGyro.movingAverage().toFixed(accelerometerPrecision);
                _this.emit("gyroscopeChange", x, y, z);
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
        });

        this.sensorTag.enableGyroscope(function (error) {
            console.debug('Sensor.start - set enableGyro');

            if (error) {
                console.error(error);
            }

            _this.sensorTag.setGyroscopePeriod(accelerometerPeriod, function (error) {
                console.debug('Sensor.start - set gyroPeriod');
                if (error) {
                    console.error(error);
                }

                _this.sensorTag.notifyGyroscope(function (error) {
                    console.log('Sensor.start - set notifyGyro');
                    if (error) {
                        console.error(error);
                    }
                    safeCallback(callback);
                });
            });
        });

        _this.sensorTag.notifySimpleKey(function (error) {
            console.debug('Sensor.start - set notifySimpleKey');
            if (error) {
                console.error(error);
            }
        });
    }

    stop(callback) {
        this.sensorTag.unnotifyAccelerometer(safeCallback(callback));
        this.sensorTag.unnotifyGyroscope(safeCallback(callback));
    }
}

module.exports = Sensor;