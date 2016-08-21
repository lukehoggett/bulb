import * as C from './constants';
import {config} from './config';
import {log} from './logger';
import noble from 'noble';
import deviceCache from './device-store';
import {bulbStore} from './device-store';

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
          log.debug('bulb.discovered resolve with', device);
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
          log.debug('Sending device connected message for device:', device, device.characteristics);
          let deviceToSend = bulbStore.serializeCharacteristics(device.uuid, device.characteristics);
          log.debug('Sending device connected message for deviceToSend:', deviceToSend);
          this.webContents.send(C.IPC_DEVICE_CONNECTED, deviceToSend);
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
      log.info('discoverSomeServicesAndCharacteristics...', device, device.peripheral.state);

      let serviceUUIDs = this.getConfigServiceUUIDs('CANDLE');
      let characteristicUUIDs = this.getConfigCharacteristicUUIDs('CANDLE');
      return new Promise((resolve, reject) => {
        // just discover defined services and characteristics
        device.peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (error, services, characteristics) => {
          if (error) {
            reject(error);
          }
          log.info('discoverSomeServicesAndCharacteristics', {
            deviceUUID: device.uuid,
            characteristics: characteristics
          });
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

    readCharacteristics(device) {
      log.info('readCharacteristics...', device);
      
      if (device.characteristics.color && device.characteristics.effect && device.characteristics.name && device.characteristics.battery) {
        log.debug('device.characteristics', device.characteristics, Object.keys(device.characteristics));
        return Promise.all(Object.keys(device.characteristics).map((characteristicKey, name) => {
          let readPromise = this.readCharacteristic(characteristicKey, device.characteristics[characteristicKey]);
          log.debug('read promise', readPromise);
          return readPromise;
        }));
      } else {
        log.warn('Do not have all characteristics');
        // reject('Do not have all characteristics');
      }
      
//       return new Promise((resolve, reject) => {
//         if (device.characteristics.color && device.characteristics.effect && device.characteristics.name && device.characteristics.battery) {
//           let all = [
//             this.readCharacteristic('color', device.characteristics.color),
//             this.readCharacteristic('effect', device.characteristics.effect),
//             this.readCharacteristic('name', device.characteristics.name),
//             this.readCharacteristic('battery', device.characteristics.battery)
//           ];
// 
//           return Promise.all(device.characteristics.map((characteristic, name) => {
//             this.readCharacteristic(name, characteristic);
//           }));
// //             .then(values => {
// //               // let device = bulbStore.getDiscoveredDeviceByUUID(device.uuid);
// //               // log.info('mapDiscoveredCharacteristics: have required characteristics', device.uuid);
// //               // send notification of values to ui
// //               bulbStore.setDiscoveredDevice(device);
// // log.debug('readCharacteristics device state', device.state);
// //               // device = bulbStore.serializeCharacteristics(device.uuid, values);
// //               log.info('+_+_+_+_+_+_+_+_+_+ mapDiscoveredCharacteristics: ', device.uuid, 'device serialized', device);
// //               resolve(device);
// //             }, error => {
// //               log.error('Promise.all failed ', error);
// //             })
// //             .catch(error => {
// //               log.error('Promise.all catch ', error);
// //             });
// //           Promise.all(all)
// //             .then(values => {
// //               // let device = bulbStore.getDiscoveredDeviceByUUID(device.uuid);
// //               // log.info('mapDiscoveredCharacteristics: have required characteristics', device.uuid);
// //               // send notification of values to ui
// //               bulbStore.setDiscoveredDevice(device);
// // log.debug('readCharacteristics device state', device.state);
// //               // device = bulbStore.serializeCharacteristics(device.uuid, values);
// //               log.info('+_+_+_+_+_+_+_+_+_+ mapDiscoveredCharacteristics: ', device.uuid, 'device serialized', device);
// //               resolve(device);
// //             }, error => {
// //               log.error('Promise.all failed ', error);
// //             })
// //             .catch(error => {
// //               log.error('Promise.all catch ', error);
// //             });
//         } else {
//           reject('Do not have all characteristics');
//         }
//       });

    }
    
    mapDiscoveredCharacteristics(data) {
      log.debug('mapDiscoveredCharacteristics', data);

      let device = bulbStore.getDiscoveredDeviceByUUID(data.deviceUUID);
      device.characteristics = {};
      
      return Promise.all(data.characteristics.map(characteristic => {
        log.debug('Promise all mapDiscoveredService');
        return this.addCharacteristicToDevice(device, characteristic);
      }));
    }
    
    addCharacteristicToDevice(device, characteristic) {
      // @TODO handle color
      let typeConfig = config.get('Bulb.Types.CANDLE');
      return new Promise((resolve, reject) => {
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
        log.debug('addCharacteristicToDevice resolve', device);
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
          log.debug('>>>>>> readCharacteristic resolving', type, characteristic, data);
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
