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
    console.info("GroupListCtrl() createGroup");
    
    this.groupService.add();
    console.info("GroupListCtrl() createGroup", this.groupService.getAll());
  }
  
  updateGroupName(group) {
    this.groupService.update(group);
    console.info("GroupListCtrl updateGroupName", group.name);
  }
  
  deleteGroup(group) {
    this.groupSevice.delete(group);
  }
  
  openAddDeviceMenu($mdOpenMenu, $event, group) {
    console.info("group: openAddDeviceMenu", group);
    this.originatorEvent = $event;
    $mdOpenMenu($event);
  }
  
  toggleDeviceToGroup(device, group) {
    console.info("toggleDeviceToGroup", device, group, this.groupService.groups);
    if (device.group == group.uuid) {
      device.group = null;
      this.bulb.devices[device.uuid].group = null;
      
      this.groupService.groups[group.uuid].devices.splice(this.groupService.groups.devices, 1);
    } else {
      device.group = group.uuid;
      this.bulb.devices[device.uuid].group = group.uuid;
      this.groupService.groups[group.uuid].devices.push(group.uuid);
    }
    console.info("toggleDeviceToGroup device", device.group, "this.bulb.devices", this.bulb.devices[device.uuid].group, "this.groupService.groups.devices", this.groupService.groups[group.uuid].devices);
    
    // update main proces storage
  }
  
}

GroupListCtrl.$inject = ['groupService', 'bulbService'];


export {
  GroupListCtrl
};
