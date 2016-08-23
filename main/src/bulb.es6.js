import * as C from './constants';
import {
  config
} from './config';
import {
  log
} from './logger';
import noble from 'noble';
import deviceCache from './device-store';
import {
  bulbStore
} from './device-store';

'use strict';

export default class Bulb {

  constructor(webContents) {
    this.webContents = webContents;
  }

  discovered(peripheral) {
    let playbulbType = this.getPlaybulbType(peripheral);

    return new Promise((resolve, reject) => {

      if (this.isPlaybulb(peripheral)) {
        let device = {};
        device.uuid = peripheral.uuid;
        device.peripheral = peripheral;
        device.type = playbulbType;
        device.characteristics = [];


        // on discovery check if device is in stored devices, if not update stored
        if (!bulbStore.hasCachedDevice(device.uuid)) {
          // save discovered device to persistent storage
          bulbStore.setCachedDevice(device);
        }

        // add properties to the device
        device.peripheral.discovered = true; // we don't save discovered so need to add it here

        // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
        bulbStore.setDiscoveredDevice(device);
        log.debug('bulb.discovered resolving');
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
    switch (peripheral.advertisement.serviceUuids[0]) {
      case config.get('Bulb.AdvertisedServiceUUIDs.CANDLE'):
        return config.get('Bulb.Types.CANDLE');
        break;
      case config.get('Bulb.AdvertisedServiceUUIDs.COLOR'):
        return config.get('Bulb.Types.COLOR');
        break;
    }
  }

  connectAndReadCharacteristics(deviceUUID) {

    noble.stopScanning();
    this.webContents.send(C.IPC_SCANNING_STOP);

    this.connect(deviceUUID)
      .then(this.discoverSomeServicesAndCharacteristics.bind(this))
      .then(this.readCharacteristics.bind(this))
      .then(this.mapDiscoveredCharacteristics.bind(this))
      .then((device) => {
        let serializedDevice = bulbStore.serializeDevice(device);
        this.webContents.send(C.IPC_DEVICE_CONNECTED, serializedDevice);
        // bulbStore.setCachedDevice(device);
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
        if (device.peripheral.state == C.CONNECTED) {
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
          reject(`Device ${ device.peripheral.name } [${ uuid }] not connectable.`);
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
    log.debug('writeCharacteristic: ...', value, type, uuid);
    let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
    let wChar = device.characteristics[type].characteristic;
    log.info(`writeCharacteristic: Writing ${ type } Characteristic with value`, value);
    return new Promise((resolve, reject) => {
      wChar.write(this.getWriteValueBuffer(type, value), true, error => {
        if (error) {
          let errorMessage = `Could not write characteristic ${ type } with value ${ value }. Error: ${ error }`;
          log.error(errorMessage);
          reject(errorMessage);
        }
        resolve(true);
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
