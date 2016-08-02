'use strict';

const ipc = require('electron').ipcRenderer;

class BulbService {
  constructor($rootScope, $timeout, $log) {
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$log = $log;

    this.devices = {};
    this.scanning = false;
    this.scanStartMessage = 'Start Scan';
    this.scanStopMessage = 'Stop Scan';

    // request any stored devices from the main process
    this.getStoredDevices();

    // listening to messages from the main
    ipc.on('device.get.stored.reply', (event, device, uuid) => this.onDeviceGetStoredReply(event, device, uuid));
    ipc.on('device.discovered', (event, device) => this.onDiscovered(event, device));
    ipc.on('scanning.start', (event) => this.onScanningStart(event));
    ipc.on('scanning.stop', (event) => this.onScanningStop(event));
    ipc.on('services', (event, services) => this.onServices(event, services));
    ipc.on('device.connected', (event, device) => this.onConnected(event, device));
    ipc.on('device.disconnected', (event, device) => this.onDisconnected(event, device));
    ipc.on('characteristics', (event, characteristic) => this.onCharacteristics(event, characteristic));

  }

  getStoredDevices() {
    // this.$log.info('Requesting stored devices');
    ipc.send('device.get.stored', (event) => {
      // this.$log.log('BulbService: get stored devices', event);
    });
  }

  isScanning() {
    return this.scanning;
  }

  startScan() {
    this.$log.info('startScan sending IPC to main');
    ipc.send('scan.start');
    this.scanning = true;
  }

  stopScan() {
    this.$log.info('stopScan sending IPC to main');
    ipc.send('scan.stop');
    this.scanning = false;
  }
  
  onScanningStart() {
    this.$log.info('onScanningStart');
    this.scanning = true;
  }
  
  onScanningStop() {
    this.$log.info('onScanningStop');
    this.scanning = false;
  }
  
  // onScanning(event) {
  //   this.$log.log('BulbService: scanning');
  //   this.scanning = true;
  //   this.$timeout(() => {}, 0);
  //   this.$log.log('Scanning?', this.scanning);
  // }

  toggleConnection(device) {
    this.$log.info(`BulbService: Handling connection to device ${device.name} [${device.uuid}] with state ${device.state}`);
    if (device.state == 'disconnected') {
      this.connect(device);
    } else {
      this.disconnect(device);
    }
  }

  connect(device) {
    this.$log.log('BulbService: connecting');
    ipc.send('device.connect', device.uuid);
  }

  disconnect(device) {
    this.$log.log('BulbService: disconnecting');
    ipc.send('device.disconnect', device.uuid);
  }

  setDeviceName(uuid, name) {
    this.$log.log('BulbService: setDeviceName', uuid, name);
  }

  getAll() {
    // this.$log.log('BulbService: getAll called: ', this.devices);
    return this.devices;
  }

  get(uuid) {
    // this.$log.log('BulbService: get called: ', uuid);
    return this.devices[uuid];
  }

  setDevice(device) {
    this.devices[device.uuid] = device;
    this.$log.info('device update', this.devices);
    ipc.send('device.set.stored', device);
  }

  getCharacteristics(uuid) {
    // this.$log.log('BulbService: getCharacteristics', uuid);
    ipc.send('device.get.characteristics', uuid);
  }

  getCharacteristic(uuid, characteristic) {
    // this.$log.log('BulbService: getCharacteristic', uuid, characteristic);
  }

  setCharacteristics(uuid, values) {

  }

  setCharacteristic(uuid, value, type) {
    this.$log.log('BulbService: setCharacteristic', uuid, value, type);
    ipc.send('device.characteristic.set', uuid, value, type);
  }

  // IPC listeners
  onDeviceGetStoredReply(event, device) {
    this.$log.log('BulbService: onDeviceGetStoredReply...', device);
    this.devices[device.uuid] = device;
  }

  onDiscovered(event, device) {
    this.$log.log('BulbService: onDiscovered...', device);
    if (device.uuid in this.devices) {
      this.$log.log('Existing device', device.uuid);
    }
    
    if (device.characteristics) {
      this.$log.log('Device Characteristics', device.characteristics);
    }
    this.devices[device.uuid] = device;
    this.$timeout(() => {}, 0);
  }

  onServices(event, services) {
    this.$log.log('BulbService: services', services);
  }

  onConnected(event, device) {
    this.$log.log('BulbService: connected', device, device.uuid);
    this.devices[device.uuid] = device;
    this.$timeout(() => {}, 0);
  }

  onDisconnected(event, device) {
    this.$log.info('BulbService: disconnected event');
    this.devices[device.uuid] = device;
  }

  onCharacteristics(event, characteristics) {
    this.$log.log('BulbService: characteristics', characteristics);
  }
}

export {
  BulbService
};
