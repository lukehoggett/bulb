'use strict';

import * as C from './constants';
import {
  config
} from './config';
import {
  log
} from './logger';
import noble from 'noble';
import BulbSerializer from './bulb-serializer';
import deviceCache from './device-store';
const bulbStore = deviceCache.bulbStore;

// import
//   BulbMessaging
// from './bulb-messaging';

export default class Bulb {

  constructor(webContents) {
    this.webContents = webContents;
  }

  discovered(peripheral) {
    let playbulbType = this.getPlaybulbType(peripheral);
    return new Promise((resolve, reject) => {
      if (this.isPlaybulb(peripheral)) {
        // look up cached device and merge discovered device characteristics
        let cachedDevice = bulbStore.getCachedDeviceByUUID(peripheral.uuid);
        log.debug('discovered cachedDevice', cachedDevice);
        let device = {};
        device.uuid = peripheral.uuid;
        device.peripheral = peripheral;
        device.type = playbulbType;
        device.characteristics = (cachedDevice ? cachedDevice.characteristics : {});

        // on discovery check if device is in stored devices, if not update stored
        if (!bulbStore.hasCachedDevice(device.uuid)) {
          // save discovered device to persistent storage
          bulbStore.setCachedDevice(device);
        }

        // add properties to the device
        device.peripheral.discovered = true; // we don't save discovered so need to add it here

        // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
        bulbStore.setDiscoveredDevice(device);
        log.debug('bulb.discovered resolving', device);
        resolve(device);
      } else {
        // @TODO confirm behaviour is ok for no playbulbs, and that they are being ignored
        log.info('bulb.discovered: Ignoring non bulb device');
        reject('bulb.discovered: Ignoring non bulb device');
      }
    });
  }

  isPlaybulb(peripheral) {
    return typeof peripheral.advertisement.manufacturerData !== 'undefined' && peripheral.advertisement.manufacturerData.toString('hex') === config.get('Bulb.MipowManufacturerData');
  }

  getPlaybulbType(peripheral) {
    let type;
    switch (peripheral.advertisement.serviceUuids[0]) {
      case config.get('Bulb.AdvertisedServiceUUIDs.CANDLE'):
        type = config.get('Bulb.Types.CANDLE');
        break;
      case config.get('Bulb.AdvertisedServiceUUIDs.COLOR'):
        type = config.get('Bulb.Types.COLOR');
        break;
    }
    return type;
  }

  connectAndReadCharacteristics(deviceUUID) {
    noble.stopScanning();
    this.webContents.send(C.IPC_SCANNING_STOP);

    this.connect(deviceUUID)
      .then(this.discoverSomeServicesAndCharacteristics.bind(this))
      .then(this.readCharacteristics.bind(this))
      .then(this.mapDiscoveredCharacteristics.bind(this))
      .then((device) => {
        let serializedDevice = BulbSerializer.serializeDevice(device);
        this.webContents.send(C.IPC_DEVICE_CONNECTED, serializedDevice);
        log.info('connectAndReadCharacteristics', '*************', device, '*************', serializedDevice);
        bulbStore.setCachedDevice(device);
      })
      .catch((error) => {
        log.error('Connection catch error:', error);
      });
  }

  connect(uuid, inGroup = false) {
    return new Promise((resolve, reject) => {
      log.info('connect: uuid', uuid);

      let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
      if (device) {
        if (device.peripheral.state === C.CONNECTED) {
          // @TODO need to send data about device if it is already connected?
          log.info(`connect: device ${device.uuid} already connected`);
        } else if (typeof device.peripheral.connect === 'function') {
          device.peripheral.connect(error => {
            if (error) {
              reject(error);
            } else {
              // store the device as discovered
              bulbStore.setDiscoveredDevice(device);
              // timout needed for device to respond after connect
              setTimeout(() => {
                log.debug('connect device state', device.peripheral.state);
                resolve(device);
              }, C.NOBLE_DISCOVER_TIMEOUT);
            }
          });
        } else {
          reject(`Device ${device.peripheral.name} [${uuid}] not connectable.`);
        }
      } else {
        reject(`Device unknown not connectable.`);
      }
    });
  }

  discoverServicesAndCharacteristics(device) {
    log.debug('discoverServicesAndCharacteristics()', device);
    this.discoverSomeServicesAndCharacteristics(device);
  }

  discoverSomeServicesAndCharacteristics(device) {
    log.info('discoverSomeServicesAndCharacteristics...');

    let serviceUUIDs = this.getConfigServiceUUIDs('CANDLE');
    let characteristicUUIDs = this.getConfigCharacteristicUUIDs('CANDLE');
    return new Promise((resolve, reject) => {
      // just discover defined services and characteristics
      device.peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
        if (error) {
          reject(error);
        }
        device.characteristics = characteristics;
        resolve(device);
      });
    });
  }

  readCharacteristics(device) {
    log.info('readCharacteristics...');

    let haveCharacteristicColor = false;
    let haveCharacteristicEffect = false;
    let haveCharacteristicName = false;
    let haveCharacteristicBattery = false;

    let typeConfig = config.get('Bulb.Types.CANDLE');
    let deviceCharacteristics = {};
    device.characteristics.forEach((characteristic, index) => {
      switch (characteristic.uuid) {
        case typeConfig.color.characteristicUUID:
          haveCharacteristicColor = true;
          deviceCharacteristics.color = characteristic;
          break;
        case typeConfig.effects.characteristicUUID:
          haveCharacteristicEffect = true;
          deviceCharacteristics.effect = characteristic;
          break;
        case typeConfig.name.characteristicUUID:
          haveCharacteristicName = true;
          deviceCharacteristics.name = characteristic;
          break;
        case typeConfig.battery.characteristicUUID:
          haveCharacteristicBattery = true;
          deviceCharacteristics.battery = characteristic;
          break;
      }
    });

    return new Promise((resolve, reject) => {
      if (haveCharacteristicColor && haveCharacteristicEffect && haveCharacteristicName && haveCharacteristicBattery) {
        device.characteristics = deviceCharacteristics;
        let readPromises = [];
        Object.keys(device.characteristics)
          .map((characteristicKey, name) => {
            readPromises.push(this.readCharacteristic(characteristicKey, device.characteristics[characteristicKey]));
          });

        Promise.all(readPromises)
          .then((promiseAllResult) => {
            device.characteristics = promiseAllResult;
            resolve(device);
          });
      } else {
        log.warn('Do not have all characteristics');
        reject('Do not have all characteristics');
      }
    });
  }

  mapDiscoveredService(deviceUUID, services) {
    services.map(service => {
      log.info('mapDiscoveredService: service', service.deviceUUID, service.name);
    });
  }

  mapDiscoveredCharacteristics(device) {
    log.debug('mapDiscoveredCharacteristics....');
    let mappedCharacteristics = {};
    return new Promise((resolve, reject) => {
      device.characteristics.forEach((characteristic) => {
        mappedCharacteristics[characteristic.type] = {};
        mappedCharacteristics[characteristic.type].characteristic = characteristic.characteristic;
        mappedCharacteristics[characteristic.type].data = characteristic.data;
      });
      device.characteristics = mappedCharacteristics;
      resolve(device);
    });
  }

  readCharacteristic(type, characteristic) {
    log.debug('readCharacteristic...', type);
    return new Promise((resolve, reject) => {
      characteristic.read((error, data) => {
        if (error) {
          log.error('Could not read characteristic', characteristic.uuid, error);
          reject('Could not read characteristic', error);
        }
        resolve({
          type: type,
          characteristic: characteristic,
          data: data
        });
      });
    });
  }

  writeCharacteristic(value, type, uuid) {
    log.debug('writeCharacteristic: ...');
    let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
    log.debug('writeCharacteristic: device', device);
    let wChar = device.characteristics[type].characteristic;
    log.info(`writeCharacteristic: Writing ${type} Characteristic with value`, value);
    return new Promise((resolve, reject) => {
      let writeValueBuffer = this.getWriteValueBuffer(type, value);
      wChar.write(writeValueBuffer, true, error => {
        if (error) {
          let errorMessage = `Could not write characteristic ${type} with value ${value}. Error: ${error}`;
          log.error(errorMessage);
          reject(errorMessage);
        }

        // update device with value set
        device.characteristics[type].data = this.getWriteValueBuffer(type, value);
        log.debug('write resove device', device);
        resolve(device);
      });
    });
  }

  getWriteValueBuffer(type, value) {
    let buffer = null;
    switch (type) {
      case 'color':
        buffer = new Buffer([value.saturation, value.red, value.green, value.blue]);
        break;
      case 'effect':
        buffer = new Buffer([value.saturation, value.red, value.green, value.blue, value.mode, '00', value.speed, '00']);
        break;
      case 'name':
        buffer = new Buffer(value);
        break;
    }
    return buffer;
  }

  // utility functions
  getConfigCharacteristicUUIDs(type) {
    return this.getUUIDfromConfig(type, 'characteristic');
  }

  getConfigServiceUUIDs(type) {
    return this.getUUIDfromConfig(type, 'service');
  }

  getUUIDfromConfig(type, property) {
    let types = config.get(`Bulb.Types.${type}`);
    let uuids = [];
    for (let name in types) {
      let typeUUID = types[name][`${property}UUID`];
      if (uuids.indexOf(typeUUID) === -1) {
        uuids.push(typeUUID);
      }
    }
    uuids.sort();
    return uuids;
  }

}
