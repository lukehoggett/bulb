var noble = require('noble');
var electron = require('electron');
var app = electron.app;
var async = require('async');

var Playbulb = require('playbulb');

// var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.

// Report crashes to our server.
// require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    console.log("Electron Ready");
    // nobleDiscover();

    playbulbExplore();
    // Create the browser window.
    // mainWindow = new BrowserWindow({width: 800, height: 600});

    // // and load the index.html of the app.
    // mainWindow.loadURL('file://' + __dirname + '/browser/index.html');

    // Open the devtools.
    // mainWindow.openDevTools();

    // Emitted when the window is closed.
    // mainWindow.on('closed', function() {
    //   // Dereference the window object, usually you would store windows
    //   // in an array if your app supports multi windows, this is the time
    //   // when you should delete the corresponding element.
    //   mainWindow = null;
    // });
});

function nobleDiscover() {
  console.log("nobleDiscover");
    noble.on('stateChange', function(state) {
        if (state == 'poweredOn') {
            noble.startScanning();
        }
    });

    noble.on('discover', function(peripheral) {
        console.info(peripheral);
        noble.stopScanning();

        console.log('peripheral with ID ' + peripheral.id + ' found');
        var advertisement = peripheral.advertisement;

        var localName = advertisement.localName;
        var txPowerLevel = advertisement.txPowerLevel;
        var manufacturerData = advertisement.manufacturerData;
        var serviceData = advertisement.serviceData;
        var serviceUuids = advertisement.serviceUuids;

        if (localName) {
            console.log('  Local Name        = ' + localName);
        }

        if (txPowerLevel) {
            console.log('  TX Power Level    = ' + txPowerLevel);
        }

        if (manufacturerData) {
            console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
        }

        if (serviceData) {
            console.log('  Service Data      = ' + serviceData);
        }

        if (localName) {
            console.log('  Service UUIDs     = ' + serviceUuids);
        }

        console.log();
        explore(peripheral);
    });
}

function explore(peripheral) {
    console.log('services and characteristics:');

    peripheral.on('disconnect', function() {
        process.exit(0);
    });

    peripheral.connect(function(error) {
        peripheral.discoverServices([], function(error, services) {
            var serviceIndex = 0;

            async.whilst(
                function() {
                    return (serviceIndex < services.length);
                },
                function(callback) {
                    var service = services[serviceIndex];
                    var serviceInfo = service.uuid;

                    if (service.name) {
                        serviceInfo += ' (' + service.name + ')';
                    }
                    console.log(serviceInfo);

                    service.discoverCharacteristics([], function(error, characteristics) {
                        var characteristicIndex = 0;

                        async.whilst(
                            function() {
                                return (characteristicIndex < characteristics.length);
                            },
                            function(callback) {
                                var characteristic = characteristics[characteristicIndex];
                                var characteristicInfo = '  ' + characteristic.uuid;

                                if (characteristic.name) {
                                    characteristicInfo += ' (' + characteristic.name + ')';
                                }

                                async.series([
                                    function(callback) {
                                        characteristic.discoverDescriptors(function(error, descriptors) {
                                            async.detect(
                                                descriptors,
                                                function(descriptor, callback) {
                                                    return callback(descriptor.uuid === '2901');
                                                },
                                                function(userDescriptionDescriptor) {
                                                    if (userDescriptionDescriptor) {
                                                        userDescriptionDescriptor.readValue(function(error, data) {
                                                            if (data) {
                                                                characteristicInfo += ' (' + data.toString() + ')';
                                                            }
                                                            callback();
                                                        });
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            );
                                        });
                                    },
                                    function(callback) {
                                        characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                                        if (characteristic.properties.indexOf('read') !== -1) {
                                            characteristic.read(function(error, data) {
                                                if (data) {
                                                    var string = data.toString('ascii');

                                                    characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                                                }
                                                callback();
                                            });
                                        } else {
                                            callback();
                                        }
                                    },
                                    function() {
                                        console.log(characteristicInfo);
                                        characteristicIndex++;
                                        callback();
                                    }
                                ]);
                            },
                            function(error) {
                                serviceIndex++;
                                callback();
                            }
                        );
                    });
                },
                function(err) {
                    peripheral.disconnect();
                }
            );
        });
    });
}

function playbulbExplore() {
    console.log("Playbulb Exploring");
    var pb = new Playbulb.PlaybulbCandle('04');
    console.log("pb object ", pb);
    pb.ready(function() {
        // console.log("pb ready");
        pb.setColor(0, 255, 0, 255); // set fixed color in Saturation, R, G, B
    });

}
