'use strict';

const ipc = require('electron')
  .ipcRenderer;

class BulbDeviceService {
  constructor($rootScope, $timeout, $log, C) {
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$log = $log;
    this.C = C;

    this.devices = {};
    this.scanning = false;
    this.scanStartMessage = 'Start Scan';
    this.scanStopMessage = 'Stop Scan';

    // request any cached devices from the main process
    this.getCachedDevices();

    // listening to messages from the main
    // refactor
    ipc.on(this.C.IPC_MAIN_GET, (event, message, data) => this.onGet(message, data));
    ipc.on(this.C.IPC_MAIN_POST, (event, message, data) => this.onPost(message, data));
    // original
    ipc.on(this.C.IPC_DEVICE_GET_CACHED_REPLY, (event, device, uuid) => this.onDeviceGetCachedReply(event, device, uuid));
    ipc.on(this.C.IPC_DEVICE_DISCOVERED, (event, device) => this.onDiscovered(event, device));
    ipc.on(this.C.IPC_SCANNING_START, (event) => this.onScanningStart(event));
    ipc.on(this.C.IPC_SCANNING_STOP, (event) => this.onScanningStop(event));
    ipc.on(this.C.IPC_DEVICE_CONNECTED, (event, device) => this.onConnected(event, device));
    ipc.on(this.C.IPC_DEVICE_DISCONNECTED, (event, device) => this.onDisconnected(event, device));
  }

  onGet(message, data) {
    this.$log.debug('BulbDeviceService onPost', message, data);
  }

  onPost(message, data) {
    this.$log.debug('BulbDeviceService onPost', message, data);
  }

  getCachedDevices() {
    ipc.send(this.C.IPC_RENDERER_GET, {message: 'device.cached'});
    ipc.send(this.C.IPC_DEVICE_GET_CACHED);
  }

  isScanning() {
    return this.scanning;
  }

  startScan() {
    this.$log.info('startScan sending IPC to main');
    ipc.send(this.C.IPC_SCAN_START);
    this.scanning = true;
  }

  stopScan() {
    this.$log.info('stopScan sending IPC to main');
    ipc.send(this.C.IPC_SCAN_STOP);
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

  toggleConnection(device) {
    this.$log.info(`BulbService: Handling connection to device ${device.name} [${device.uuid}] with state ${device.state}`);
    if (device.state === this.C.DISCONNECTED) {
      this.connect(device);
    } else {
      this.disconnect(device);
    }
  }

  connect(device) {
    this.$log.log('BulbService: connecting');
    ipc.send(this.C.IPC_DEVICE_CONNECT, device.uuid);
  }

  disconnect(device) {
    this.$log.log('BulbService: disconnecting');
    ipc.send(this.C.IPC_DEVICE_DISCONNECT, device.uuid);
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
    ipc.send(this.C.IPC_DEVICE_SET_CACHED, device);
  }

  getCharacteristics(uuid) {
    // this.$log.log('BulbService: getCharacteristics', uuid);
    ipc.send(this.C.IPC_DEVICE_CHARACTERISTICS_GET, uuid);
  }

  getCharacteristic(uuid, characteristic) {
    // this.$log.log('BulbService: getCharacteristic', uuid, characteristic);
  }

  setCharacteristics(uuid, values) {

  }

  setCharacteristic(uuid, value, type) {
    this.$log.log('BulbService: setCharacteristic', uuid, value, type);
    ipc.send(this.C.IPC_DEVICE_CHARACTERISTIC_SET, uuid, value, type);
  }

  // IPC listeners
  onDeviceGetCachedReply(event, device) {
    this.$log.log('BulbService: onDeviceGetCachedReply...', device);

    // @TODO move - here for testing
    // dummy call
    // this.$log.debug('isEffectOrColor', this.isEffectOrColor(device.characteristics));
    // this.$log.debug('getBulbType', this.getBulbType(device));
    // this.$log.debug('isEffect', this.isEffect(device));
    // this.$log.debug('isColor', this.isColor(device));
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

  onConnected(event, device) {
    this.$log.log('BulbService: connected', device, device.uuid);
    this.devices[device.uuid] = device;
    this.$timeout(() => {}, 0);
  }

  onDisconnected(event, device) {
    this.$log.info('BulbService: disconnected event');
    this.devices[device.uuid] = device;
  }

  getBulbType(device) {
    let type = null;
    if (device.type) {
      if (device.type.color.serviceUUID === this.C.SERVICE_UUID_CANDLE) {
        type = this.C.NAME_CANDLE;
      } else if (device.type.color.serviceUUID === this.C.SERVICE_UUID_COLOR) {
        type = this.C.NAME_COLOR;
      }
    }
    return type;
  }

  isEffectOrColor(characteristics) {
    let result = this.C.TYPE_EFFECT;
    // this.$log.debug('isEffectOrColor', characteristics);
    if (characteristics.effect && characteristics.effect.data) {
      let effectsOff = (this.C.EFFECTS_OFF_VALUES.length === characteristics.effect.data.length) && this.C.EFFECTS_OFF_VALUES.every((value, index) => {
        return value === characteristics.effect.data[index];
      });

      if (effectsOff) {
        result = this.C.TYPE_COLOR;
      }
      return result;
    }
  }

  isEffect(characteristics) {
    return this.isEffectOrColor(characteristics) === this.C.TYPE_EFFECT;
  }

  isColor(characteristics) {
    return this.isEffectOrColor(characteristics) === this.C.TYPE_COLOR;
  }

  isDiscovered(uuid) {
    return this.get(uuid).peripheral.discovered;
  }

  isConnected(uuid) {
    return this.get(uuid).peripheral.state === this.C.CONNECTED;
  }

  getLastSeen(uuid) {
    return this.get(uuid).peripheral.lastSeen;
  }

}

export {
  BulbDeviceService
};
