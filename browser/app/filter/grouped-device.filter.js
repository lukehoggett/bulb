'use strict';
/**
 * @description
 *
 */
export function GroupedDevice() {
  // 'ngInject';
  return function(devices, groupUUID) {
    let out = [];
    angular.forEach(devices, (device) => {
      if (device.group === "" || device.group === null || device.group == groupUUID) {
        out.push(device);
      }
    });
    return out;
  };
}
