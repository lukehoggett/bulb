'use strict';
/**
 * @description
 *
 */
export function GroupedDevice() {
  // 'ngInject';
  return function(devices, groupUUID) {
    let out = [];
    // console.info("filter GroupedDevice", devices, groupUUID);
    angular.forEach(devices, (device) => {
      // console.info("device.group", device.group);
      if (device.group === null || device.group == groupUUID) {
        out.push(device);
      }
    });
    return out;
  };
}
