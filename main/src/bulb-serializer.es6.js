'use strict';

import {
  log
} from './logger';

export default class BulbSerializer {
  // constructor() {
  // }

  static serializeDevice(device) {
    log.debug('BulbSerializer.serializeDevice()', device);
    return {
      uuid: device.data.get('uuid'),
      peripheral: this.serializePeripheral(device.data.get('peripheral')),
      type: device.data.get('type'),
      characteristics: this.serializeCharacteristics(device.data.get('characteristics'))
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
    log.debug('BulbSerializer.serializePeripheral()', peripheral);
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
    if (characteristics) {
      Object.keys(characteristics)
        .map((characteristicType, index) => {
          serializedCharacteristics[characteristicType] = this.serializeCharacteristic(characteristics[characteristicType]);
        });
    }
    return serializedCharacteristics;
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
