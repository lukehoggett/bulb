var noble = require('noble');

noble.on('stateChange', function(state) {
    console.log("Noble State Change 1", state);
    if (state == 'poweredOn') {
        console.log("Noble State Change 2", state);
        noble.startScanning();
    }
    
    console.log("Noble State Change 3 ", state);
});
