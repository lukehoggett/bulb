/* jshint esnext: true */
/* jshint node: true */
'use strict';

class GroupListCtrl {

  constructor(groupService, bulbService) {

    // this.$rootScope = $rootScope;
    // this.$mdSidenav = $mdSidenav;
    // this.$mdDialog = $mdDialog;
    this.bulb = bulbService;
    this.groupService = groupService;
    
    this.originatorEvent;
  }

  
  
  createGroup() {
    this.groupService.add();
  }
  
  updateGroupName(group) {
    this.groupService.update(group);
  }
  
  deleteGroup(group) {
    this.groupSevice.delete(group);
  }
  
  openAddDeviceMenu($mdOpenMenu, $event, group) {
    this.originatorEvent = $event;
    $mdOpenMenu($event);
  }
  
  toggleDeviceToGroup(device, group) {
    if (device.group == group.uuid) {
      this.bulb.devices[device.uuid].group = null;
      this.groupService.groups[group.uuid].devices.splice(this.groupService.groups.devices, 1);
    } else {
      this.bulb.devices[device.uuid].group = group.uuid;
      this.groupService.groups[group.uuid].devices.push(device.uuid);
    }
    
    // update main proces storage
    this.groupService.update(this.groupService.groups[group.uuid]);
    this.bulb.setDevice(this.bulb.devices[device.uuid]);
  }
  
}

GroupListCtrl.$inject = ['groupService', 'bulbService'];


export {
  GroupListCtrl
};
