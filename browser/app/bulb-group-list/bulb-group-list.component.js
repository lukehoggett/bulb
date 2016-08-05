'use strict';

export function bulbGroupListComponent() {
  let component = {
    scope: {},
    restrict: 'EA',
    templateUrl: 'app/bulb-group-list/bulb-group-list.views/bulb-group-list.view.html',
    controller: BulbGroupListController,
    controllerAs: '$ctrl',
    bindToController: true
  };
  return component;
}

class BulbGroupListController {

  constructor($rootScope, groupService, bulbService, $log) {

    this.$rootScope = $rootScope;
    this.bulb = bulbService;
    this.groupService = groupService;
    this.$log = $log;

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

    if (group.devices.indexOf(device.uuid) !== -1) {
      // removing
      this.groupService.groups[group.uuid].devices.splice(this.groupService.groups.devices, 1);
    } else {
      //adding
      this.groupService.groups[group.uuid].devices.push(device.uuid);
    }
    // update main proces storage
    this.groupService.update(this.groupService.groups[group.uuid]);
  }

  selectGroup(group) {
    this.$log.log('GroupListCtrl: selectGroup', group);
    this.$rootScope.$broadcast('group_selected', group.uuid);
  }

  isDeviceInGroup(group, device) {
    // this.$log.info('GroupListCtrl: isDeviceInGroup', group, device);
    return group.devices.indexOf(device.uuid) !== -1;
  }

  isDeviceInMenu(device, group) {
    let result = true;
    if (group.devices.indexOf(device.uuid) === -1) {
      // device isn't selected for current group so chjeck if it is selected in another group
      angular.forEach(this.groupService.groups, (_group) => {
        if (_group.uuid !== group.uuid) { // ignore current group
          if (_group.devices.indexOf(device.uuid) !== -1) {
            result = false;
          }
        }
      });
    }

    return result;
  }

}
