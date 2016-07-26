'use strict';
/**
 * @description
 *
 */
export function GroupedDevice() {
  // 'ngInject';
  return function(devices, device, groups, group) {
    let currentGroupUUID = group.uuid;
    let deviceIsInCurrentGroup = false;
    let deviceIsInOtherGroup = false;
    
    // if (group.devices.indexOf())
    // console.info("GroupedDevice", "device", device, "devices", devices, "groups", groups, "currentGroupUUID", currentGroupUUID);
    // determine whether a device is in any group
    // determine whether it is in use by a group other than the current one 
    let out = [];
    angular.forEach(groups, (group) => {
      // console.info("Looping groups: group", group);
      
      // if ()
    });
    
    
    
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
