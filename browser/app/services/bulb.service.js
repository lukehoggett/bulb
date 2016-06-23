/* jshint esnext: true */
/* jshint node: true */
"use strict";
const ipc = require("electron").ipcRenderer;

class BulbService {
    constructor($rootScope, $timeout) {
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      
      this.devices = {};
      this.scanning = false;
      
      // request any stored devices from the main process
      this.getStoredDevices();
      
      // listening to messages from the main
      ipc.on("device.get.stored.reply", (event, device, uuid) => this.onDeviceGetStoredReply(event, device, uuid));
      ipc.on("discovered", (event, devices) => this.onDiscovered(event, devices));
      ipc.on("scanning", (event) => this.onScanning(event));
      ipc.on("services", (event, services) => this.onServices(event, services));
      ipc.on("connected", (event, device) => this.onConnected(event, device));
      ipc.on("disconnected", (event, device) => this.onDisconnected(event, device));
      ipc.on("characteristics", (event, characteristic) => this.onCharacteristics(event, characteristic));

    }
    
    getStoredDevices() {
      ipc.send("device.get.stored", (event) => {
        console.log("BulbService: get stored devices", event);
      });
    }
    
    isScanning() {
      return this.scanning;
    }
    
    startScan() {
      ipc.send("scan.start");
      this.scanning = true;
    }
    
    stopScan() {
      ipc.send("scan.stop");
      this.scanning = false;
    }
    
    toggleConnection(device) {
      console.info(`BulbService: Handling connection to device ${device.name} [${device.uuid}] with state ${device.state}`);
      if (device.state == "disconnected") {
        this.connect(device);
      } else {
        this.disconnect(device);
      }
    }
    
    connect(device) {
      console.log("BulbService: connecting");
      ipc.send("device.connect", device.uuid);
    }
    
    disconnect(device) {
      console.log("BulbService: disconnecting");
      ipc.send("device.disconnect", device.uuid);
    }
    
    setDeviceName(uuid, name) {
      console.log("BulbService: setDeviceName", uuid, name);
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
      console.log("BulbService: getCharacteristics", uuid);
      ipc.send("device.get.characteristics", uuid);
    }
    
    getCharacteristic(uuid, characteristic) {
      console.log("BulbService: getCharacteristic", uuid, characteristic);
    }
    
    setCharacteristics(uuid, values) {
      
    }
    
    setCharacteristic(uuid, value, type) {
      console.log("BulbService: setCharacteristic", uuid, value, type);
      ipc.send("device.characteristic.set", uuid, value, type);
    }
    
    // IPC listeners
    onDeviceGetStoredReply(event, device) {
      console.log("BulbService: device.get.stored.reply", device);
      this.devices[device.uuid] = device;
    }
    
    onDiscovered(event, device) {
      console.log("BulbService: onDiscovered", device);
      if (device.uuid in this.devices) {
        console.log("Existing device");
      }
      this.devices[device.uuid] = device;
      this.$timeout(() => {}, 0);
    }
    
    onScanning(event) {
      console.log("BulbService: scanning");
      this.scanning = true;
      this.$timeout(() => {}, 0);
      console.log("Scanning?", this.scanning);
    }
    
    onServices(event, services) {
      console.log("BulbService: services", services);
    }
    
    onConnected(event, device) {
      console.log("BulbService: connected", device, device.uuid);
      this.devices[device.uuid] = device;
      this.$timeout(() => {}, 0);
    }
    
    onDisconnected(event, device) {
      console.info("BulbService: disconnected event");
      this.devices[device.uuid] = device;
    }
    
    onCharacteristics(event, characteristics) {
      console.log("BulbService: characteristics", characteristics);
    }
}

export {
  BulbService
};
