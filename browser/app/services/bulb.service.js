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
      console.log("getCharacteristics", uuid);
      ipc.send("device.get.characteristics", uuid);
    }
    
    getCharacteristic(uuid, characteristic) {
      console.log("getCharacteristic", uuid, characteristic);
    }
    
    setCharacteristics(uuid, values) {
      
    }
    
    setCharacteristic(uuid, characteristic, value, type) {
      console.log("setCharacteristic", uuid, characteristic, value, type);
      // ipc.send("value", value);
      // ipc.send("device.characteristic.set", uuid, characteristic, value, type);
      ipc.send("device.characteristic.set-test", uuid, value, characteristic, type);
    }
    
    // IPC listeners
    onDeviceGetStoredReply(event, device, uuid) {
      console.log("BulbService:", this);
      console.log("BulbService: device.get.stored.reply", device, uuid, this.devices, this);
      this.devices[device.uuid] = device;
    }
    
    onDiscovered(event, device) {
      console.log("BulbService: Discovered Device", device);
      if (device.uuid in this.devices) {
        console.log("Existing device");
      }
      this.devices[device.uuid] = device;
      this.$timeout(() => {}, 0);
    }
    
    onScanning(event) {
      console.log("scanning");
      this.scanning = true;
      this.$timeout(() => {}, 0);
      console.log("Scanning?", this.scanning);
    }
    
    onServices(event, services) {
      console.log("services", services);
    }
    
    onConnected(event, device) {
      console.log("connected", device, device.uuid, this.devices, this);
      this.devices[device.uuid] = device;
      this.$timeout(() => {}, 0);
    }
    
    onDisconnected(event, device) {
      console.info("disconnected event");
      this.devices[device.uuid] = device;
    }
    
    onCharacteristics(event, characteristics) {
      console.log("characteristics", characteristics);
    }
}

export {
  BulbService
};
