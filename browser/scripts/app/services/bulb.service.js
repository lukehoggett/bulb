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
        // console.log("BulbService: Devices", this.devices);
        this.$timeout(() => {}, 0);
        
      });
      
      
      ipc.on('scanning', (event) => {
        console.log("scanning");
        this.scanning = true;
        this.$timeout(() => {}, 0);
        console.log("Scanning?", this.scanning);
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
        this.$timeout(() => {}, 0);
      });
      
      ipc.on('disconnected', (event, device) => {
        console.info("disconnected event");
        this.devices[device.uuid] = device;
      });
      
      ipc.on('characteristics', (event, characteristics) => {
        console.log("characteristics", characteristics);
      });
      
      
      // ipc.send("device.characteristic.get", )
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
    
    handleConnection(device) {
      console.info("Handling connection", device.state, device.uuid);
      console.info(`Handling connection: Device ${device.name} [${device.uuid}] is ${device.state}`);
      if (device.state == "disconnected") {
        this.connect(device);
      } else {
        this.disconnect(device);
      }
    }
    
    connect(device) {
      console.log("BulbService: connecting");
      ipc.send('device.connect', device.uuid);
    }
    
    disconnect(device) {
      console.log("BulbService: disconnecting");
      ipc.send('device.disconnect', device.uuid);
    }
    
    setDeviceName(uuid, name) {
      console.log("BulbService: setDeviceName", uuid, name);
      ipc.send('device.set-name', uuid, name);
    }
    
    getDevices() {
      console.log("BulbService: getDevices called: ", this.devices);
      return this.devices;
    }
    
    getDevice(uuid) {
      console.log("BulbService: getDevices called: ", this.devices);
      return this.devices[uuid];
    }
    
    getCharacteristics(uuid) {
      console.log("getCharacteristics", uuid);
      ipc.send('device.characteristics.get', uuid);
    }
    
    getCharacteristicValue(uuid, characteristic) {
      console.log("getCharacteristicValue", uuid, characteristic);
    }
}

export {
  BulbService
};
