import * as C from './constants';
import {config} from './config';
import {log} from './logger';
import noble from 'noble';
import deviceCache from './device-store';
import {bulbStore} from './device-store';

  'use strict';

  let playbulbType = '';

  export default class Bulb {

    constructor(webContents) {
      this.webContents = webContents;
    }

    discovered(device) {
      // check which type of device it is
      switch (device.advertisement.serviceUUIDs) {
        case config.get('Bulb.AdvertisedServiceUUIDs.CANDLE'):
          playbulbType = config.get('Bulb.Types.CANDLE');
          break;
          playbulbType = config.get('Bulb.Types.COLOR');
          playbulbType = type.COLOR;
          break;
        default:

      }
      device.type = playbulbType;
      log.info('onNobleDiscovered: Discovered Playbulb device with UUID', device.uuid);
      log.info('onNobleDiscovered: device.advertisement.serviceUuids', device.advertisement.serviceUuids);
      // on discovery check if device is in stored devices, if not update stored
      if (!bulbStore.hasCachedDevice(device.uuid)) {
        // save discovered device to persistent storage
        bulbStore.setCachedDevice(device);
      }

      // add properties to the device
      device.discovered = true; // we don't save discovered so need to add it here
      // log.debug('bulb.discovered', device);
      // this is needed to add the noble extra object stuff that can't be stored in the persistent storage
      bulbStore.setDiscoveredDevice(device);

      return device;
    }
    
    connectAndReadCharacteristics(deviceUUID) {
      
      noble.stopScanning();
      this.webContents.send(C.IPC_SCANNING_STOP);
      
      this.connect(deviceUUID)
        .then(this.discoverSomeServicesAndCharacteristics.bind(this))
        .then(this.mapDiscoveredCharacteristics.bind(this))
        .then(this.readCharacteristics.bind(this))
        .then((device) => {
          log.debug('Sending device connected message for device:', device);
          let deviceToSend = bulbStore.serializeDevice(device);
          this.webContents.send(C.IPC_DEVICE_CONNECTED, deviceToSend);
        })
        .catch((error) => {
          log.error('Connection catch error:', error);
        });
    }
    
    connect(uuid, inGroup = false) {

      return new Promise((resolve, reject) => {
        log.info('connect: to uuid', uuid);

        let device = bulbStore.getDiscoveredDeviceByUUID(uuid);
        // log.info('connect device:', device);
        if (device) {
          if (device.state == C.CONNECTED) {
            // @TODO need to send data about device is it is already connected
            log.info(`connect: device ${device.uuid} already connected`);
          } else if (typeof device.connect === 'function') {
            device.connect(error => {
              if (error) {
                reject(error);
              } else {
                log.debug('connect device state 0', device.state);
                // store the device as discovered
                bulbStore.setDiscoveredDevice(device);
                log.debug('connect device state 1', device.state);
log.debug('connect device state 2', device.state);
                // timout needed for device to respond after connect
                setTimeout(() => {
                  resolve(device);
                }, C.NOBLE_DISCOVER_TIMEOUT);
              }
            });
          } else {
            reject(`Device ${ device.name } [${ uuid }] not connectable.`);
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
        device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
          if (error) {
            reject(error);
          }
          resolve({
            deviceUUID: device.uuid,
            characteristics: characteristics
          });
        });
      });
    }

    mapDiscoveredService(deviceUUID, services) {
      services.map(service => {
        log.info('mapDiscoveredService: service', service.deviceUUID, service.name);
      });
    }

    mapDiscoveredCharacteristics(data) {
      let deviceUUID = data.deviceUUID;
      let characteristics = data.characteristics;

      return new Promise((resolve, reject) => {
        let device = bulbStore.getDiscoveredDeviceByUUID(deviceUUID);
        device.characteristics = {};
        
        let devicePromises = [];
        characteristics.forEach((characteristic) => {
          devicePromises.push(this.addCharacteristicToDevice(device, characteristic));
        });
        
        Promise.all(devicePromises)
        .then((values) => {
          log.info('devicePromises', values);
        }, error => {
          log.error('devicePromises', error);
        })
        .catch(error => {
          log.error('catch devicePromises', error);
        });
        // characteristics.map(characteristic => {
        //   device = this.addCharacteristicToDevice(device, characteristic);
        // });
log.debug('mapDiscoveredCharacteristics device ', device.state);
        resolve(device);
      });
    }
    
    addCharacteristicToDevice(device, characteristic) {
      // @TODO handle color
      let typeConfig = config.get('Bulb.Types.CANDLE');

      switch (characteristic.uuid) {
        case typeConfig.color.characteristicUUID:
          device.characteristics.color = characteristic;
          break;
        case typeConfig.effects.characteristicUUID:
          device.characteristics.effect = characteristic;
          break;
        case typeConfig.name.characteristicUUID:
          device.characteristics.name = characteristic;
          break;
        case typeConfig.battery.characteristicUUID:
          device.characteristics.battery = characteristic;
          break;
      }
      return device;
    }

    readCharacteristics(device) {
      log.info('readCharacteristics');
      log.debug('readCharacteristics device state', device.state);
      return new Promise((resolve, reject) => {
        if (device.characteristics.color && device.characteristics.effect && device.characteristics.name && device.characteristics.battery) {
          let all = [
            this.readCharacteristic('color', device.characteristics.color),
            this.readCharacteristic('effect', device.characteristics.effect),
            this.readCharacteristic('name', device.characteristics.name),
            this.readCharacteristic('battery', device.characteristics.battery)
          ];

          Promise.all(all)
            .then(values => {
              // let device = bulbStore.getDiscoveredDeviceByUUID(device.uuid);
              // log.info('mapDiscoveredCharacteristics: have required characteristics', device.uuid);
              // send notification of values to ui
              bulbStore.setDiscoveredDevice(device);
log.debug('readCharacteristics device state', device.state);
              device = bulbStore.serializeCharacteristics(device.uuid, values);
              // log.info('+_+_+_+_+_+_+_+_+_+ mapDiscoveredCharacteristics: ', device.uuid, 'device serialized', device);
              resolve(device);
            }, error => {
              log.error('Promise.all failed ', error);
            })
            .catch(error => {
              log.error('Promise.all catch ', error);
            });
        } else {
          reject('Do not have al characteristics');
        }
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
      let wChar = device.characteristics[type];
      log.info(`writeCharacteristic: Writing ${ type } Characteristic with value`, value);

      return new Promise((resolve, reject) => {
        log.info('writeCharacteristic: Promise', wChar);
        wChar.write(getWriteValueBuffer(type, value), true, error => {
          if (error) {
            let errorMessage = `Could not write characteristic ${ type } with value ${ value }. Error: ${ error }`;
            log.error(errorMessage);
            reject(errorMessage);
          }
          log.info(`writeCharacteristic: wrote characteristic ${ type } with value`, value);
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
