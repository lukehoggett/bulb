/* jshint esnext: true */
/* jshint node: true */
()=> {
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbService {
    constructor($rootScope) {
      this.devices = {};
      this.scanning = false;
      
      this.$rootScope = $rootScope;
      
      // request any stored devices from the main process
      ipc.send('get-stored-devices', function(event) {
        console.log("BulbService: get stored devices", event);
      });
      
      ipc.on('get-stored-devices-reply', function(event, device, uuid) {
        console.log("BulbService: receiving stored devices", device, uuid);
        this.devices[device.uuid] = device;
      }.bind(this));

      ipc.on('discovered', function(event, device) {
        console.log("BulbService: Discovered Device", device);
        
        
        if (device.uuid in this.devices) {
          console.log("Existing device");
        }
        this.devices[device.uuid] = device;
        console.log("BulbService: Devices", this.devices);
        // $rootScope.$broadcast('device.update');
        
      }.bind(this));
      
      
      
      
      
      ipc.on('services', function(event, services) {
        console.log("services", services);
      });
      ipc.on('characteristics', function(event, characteristics) {
        console.log("characteristics", characteristics);
      });
      
    }
    
    isScanning() {
      return this.scanning;
    }
    
    startScan() {
      ipc.send('scan.start');
      this.scanning = true;
    }
    
    stopScan() {
      ipc.send('scan.stop');
      this.scanning = false;
    }
    
    connect(device) {
      console.log("BulbService: connecting to ", device.uuid);
      ipc.send('device.connect', device.uuid);
    }
    
    setDeviceName(uuid, name) {
      console.log("BulbService: setDeviceName", uuid, name);
      ipc.send('device.set-name', uuid, name);
    }
    
    getDevices() {
      console.log("BulbService: getDevices called: ", this.devices);
      return this.devices;
    }
}

}();

export {
  BulbService
};
