/* jshint esnext: true */
/* jshint node: true */
'use strict';

class GroupListCtrl {

  constructor($rootScope, $mdSidenav, $mdDialog, bulbService, groupService) {

    // this.$rootScope = $rootScope;
    // this.$mdSidenav = $mdSidenav;
    // this.$mdDialog = $mdDialog;
    // this.bulb = bulbService;
    this.groupService = groupService;
    
    // this.originatorEvent;
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
  
  // selectDevice(device) {
  //   console.log("GroupListCtrl: selectDevice", device);
  //   this.$rootScope.$broadcast('device_selected', device.uuid);
  //   this.showCharacteristicsPanel();
  // }
  // 
  // getCharacterisics(device) {
  //   console.log("group get characteristics", device);
  //   this.bulb.getCharacteristics(device.uuid);
  // }
  // 
  // showCharacteristicsPanel() {
  //   console.log("show characteristic");
  //   this.$mdSidenav('characteristic').toggle();
  // }
  // 
  // updateDeviceName(uuid) {
  //   console.log("updateDeviceName", uuid, this.bulb.devices[uuid]);
  //   // send update command to main process
  //   this.bulb.setCharacteristic(uuid, this.bulb.devices[uuid].name, 'name');
  // }
  // 
  // openMoreMenu($mdOpenMenu, event) {
  //   console.info("group: openMoreMenu", $mdOpenMenu, event);
  //   this.originatorEvent = event;
  //   $mdOpenMenu(event);
  // }
  // 
  // addToGroupClick(device) {
  //   console.info("group: addToGroup", device);
  // }
  // 
  // addToGroup(device) {
  //   console.info("group: addToGroup", device);
  //   // this.$mdDialog.show(
  //   //   this.$mdDialog.alert()
  //   //     .targetEvent(this.originatorEvent)
  //   //     .clickOutsideToClose(true)
  //   //     .parent('body')
  //   //     .title('Add to Group')
  //   //     .textContent('Add to an existing group or create one')
  //   //     .ok('Add')
  //   //     .cancel('Cancel')
  //   // );
  //   // this.$mdDialog.show(
  //   //   this.$mdDialog.prompt()
  //   //     .targetEvent(this.originatorEvent)
  //   //     .clickOutsideToClose(true)
  //   //     .template(
  //   //       `<md-input-container>
  //   //     <label>State</label>
  //   //     <md-select>
  //   //       <md-option value="Group 1" ng-disabled="$index === 1">
  //   //         group 1
  //   //       </md-option>
  //   //       <md-option value="Group 2" ng-disabled="$index === 1">
  //   //         group 2
  //   //       </md-option>
  //   //     </md-select>
  //   //   </md-input-container>`
  //   //     )
  //   //     .parent('body')
  //   //     .title('Add to Group')
  //   //     .textContent('Add to an existing group or create one')
  //   //     .ok('Add')
  //   //     .cancel('Cancel')
  //   // );
  //   
  //   var parentEl = angular.element(document.body);
  //      this.$mdDialog.show({
  //        parent: parentEl,
  //        targetEvent: this.originatorEvent,
  //        template:
  //          `<md-dialog aria-label="Group dialog">
  //            <md-dialog-content>
  //              <md-input-container>
  //              <label>State</label>
  //              <md-select>
  //                <md-option value="Group 1">
  //                  group 1
  //                </md-option>
  //                <md-option value="Group 2">
  //                  group 2
  //                </md-option>
  //              </md-select>
  //            </md-input-container>
  //            </md-dialog-content>
  //            <md-dialog-actions>
  //              <md-button ng-click="closeDialog()" class="md-primary">
  //                Close Dialog
  //              </md-button>
  //            </md-dialog-actions>
  //          </md-dialog>`,
  //        locals: {
  //          items: []
  //        },
  //        controller: GroupListCtrl
  //     });
  //   
  //   this.originatorEvent = null;
  // }
}

GroupListCtrl.$inject = ['$rootScope', '$mdSidenav', '$mdDialog', 'bulbService', 'groupService'];


export {
  GroupListCtrl
};
