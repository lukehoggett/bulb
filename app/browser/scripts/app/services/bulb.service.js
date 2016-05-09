/* jshint esnext: true */
/* jshint node: true */
'use strict';
const ipc = require('electron').ipcRenderer;

class BulbService {
    constructor($rootScope, $timeout) {
      this.devices = {};
      this.scanning = false;
      
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      
      // request any stored devices from the main process
      ipc.send('get-stored-devices', (event) => {
        console.log("BulbService: get stored devices", event);
      });
      
      ipc.on('get-stored-devices-reply', (event, device, uuid) => {
        console.log("BulbService: receiving stored devices", device, uuid);
        this.devices[device.uuid] = device;
      });

      ipc.on('discovered', (event, device) => {
        console.log("BulbService: Discovered Device", device);
        if (device.uuid in this.devices) {
          console.log("Existing device");
        }
        this.devices[device.uuid] = device;
        console.log("BulbService: Devices", this.devices);
        // $rootScope.$broadcast('device.update');
        this.$timeout(function () {}, 0);
        
      });
      
      
      ipc.on('scanning', (event) => {
        console.log("scanning", event);
        this.scanning = true;
        this.$timeout(function () {}, 0);
      });
      
      
      ipc.on('services', (event, services) => {
        console.log("services", services);
      });      
      // ipc.on('connected', (event, device) => {
      //   
      //   console.log("connected", device, device.uuid, this.devices, this);
      //   this.devices[device.uuid] = device;
      // });
      
      // receive info about devices that are connected
      ipc.on('connected', (event, device) => {
        
        console.log("connected", device, device.uuid, this.devices, this);
        this.devices[device.uuid] = device;
        this.$timeout(function () {}, 0);
      });
      
      ipc.on('characteristics', (event, characteristics) => {
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
      console.info("BulbService: connecting device list ", this.devices);
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

export {
  BulbService
};
