'use strict';

import {
  log
} from './logger';

export default class BulbSerializer {
  // constructor() {
  // }

  static serializeDevice(device) {
    // log.debug('serializeDevice', device);
    return {
      uuid: device.uuid,
      peripheral: this.serializePeripheral(device.peripheral),
      type: device.type,
      characteristics: this.serializeCharacteristics(device.characteristics)
    };
  }
  /**
   * Prepare a Noble peripheral for serialization to send to a renderer process.
   Copies out all the attributes the renderer might need.  Seems to be
   necessary as Noble's objects don't serialize well and lose attributes when
   pass around with the ipc class.
   log.info('Serializing peripheral', peripheral);
   * @return {[type]} [description]
   */
  static serializePeripheral(peripheral) {
    // log.debug('bulbStore serialize peripheral', peripheral);
    return {
      id: peripheral.id,
      name: peripheral.advertisement.localName,
      address: peripheral.address,
      state: peripheral.state, // should we store whether it is connected
      advertisement: peripheral.advertisement,
      uuid: peripheral.uuid,
      addressType: peripheral.addressType,
      connectable: peripheral.connectable,
      discovered: peripheral.discovered || false,
      lastSeen: Date.now()
    };
  }

  static serializeCharacteristics(characteristics) {
    // @TODO fix this
    // log.debug('serializeCharacteristics', characteristics, Object.keys(characteristics));
    let serializedCharacteristics = {};

    Object.keys(characteristics)
      .map((characteristicType, index) => {
        // log.debug('characteristicType', characteristicType);
        serializedCharacteristics[characteristicType] = this.serializeCharacteristic(characteristics[characteristicType]);
      });
    // log.debug('serializedCharacteristics', serializedCharacteristics);
    return serializedCharacteristics;

    // let device = this.serializeDevice(this.getDiscoveredDeviceByUUID(deviceUUID));
    // let charList = {};
    // log.debug('characteristicValues', characteristicValues);
    //
    // for (let characteristic of characteristicValues) {
      // log.debug(characteristicValues[characteristic]);
    //   // charList[c.type] = {
    //   //   uuid: c.characteristic.uuid,
    //   //   name: c.characteristic.name,
    //   //   type: c.characteristic.type,
    //   //   value: c.data
    //   // };
    // }
    // // characteristicValues.forEach(c => {
    // //   charList[c.type] = {
    // //     uuid: c.characteristic.uuid,
    // //     name: c.characteristic.name,
    // //     type: c.characteristic.type,
    // //     value: c.data
    // //   };
    // // });
    // device.characteristics = charList;
    // return device;
  }

  static serializeCharacteristic(characteristic) {
    // log.debug('characteristic DATA', characteristic.data, Array.from(characteristic.data));

    return {
      characteristic: {
        uuid: characteristic.characteristic.uuid,
        name: characteristic.characteristic.name,
        type: characteristic.characteristic.type
      },
      data: Array.from(characteristic.data)
    };
  }
}
