/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;

class DeviceListCtrl {

  constructor($rootScope, $mdSidenav, $mdDialog, bulbService) {

    this.$rootScope = $rootScope;
    this.$mdSidenav = $mdSidenav;
    this.$mdDialog = $mdDialog;
    this.bulb = bulbService;
    
    this.originatorEvent;
  }

  selectDevice(device) {
    console.log("DeviceListCtrl: selectDevice", device);
    this.$rootScope.$broadcast('device_selected', device.uuid);
    this.showCharacteristicsPanel();
  }
  
  getCharacterisics(device) {
    console.log("list get characteristics", device);
    this.bulb.getCharacteristics(device.uuid);
  }

  showCharacteristicsPanel() {
    console.log("show characteristic");
    this.$mdSidenav('characteristic').toggle();
  }
  
  updateDeviceName(uuid) {
    console.log("updateDeviceName", uuid, this.bulb.devices[uuid]);
    // send update command to main process
    this.bulb.setCharacteristic(uuid, this.bulb.devices[uuid].name, 'name');
  }
  
  openMoreMenu($mdOpenMenu, $event) {
    console.info("list: openMoreMenu", $mdOpenMenu, $event);
    this.originatorEvent = $event;
    $mdOpenMenu($event);
  }
  
  addToGroupClick(device) {
    console.info("list: addToGroup", device);
  }
  
  addToGroup(device) {
    console.info("list: addToGroup", device);
    // this.$mdDialog.show(
    //   this.$mdDialog.alert()
    //     .targetEvent(this.originatorEvent)
    //     .clickOutsideToClose(true)
    //     .parent('body')
    //     .title('Add to Group')
    //     .textContent('Add to an existing group or create one')
    //     .ok('Add')
    //     .cancel('Cancel')
    // );
    // this.$mdDialog.show(
    //   this.$mdDialog.prompt()
    //     .targetEvent(this.originatorEvent)
    //     .clickOutsideToClose(true)
    //     .template(
    //       `<md-input-container>
    //     <label>State</label>
    //     <md-select>
    //       <md-option value="Group 1" ng-disabled="$index === 1">
    //         group 1
    //       </md-option>
    //       <md-option value="Group 2" ng-disabled="$index === 1">
    //         group 2
    //       </md-option>
    //     </md-select>
    //   </md-input-container>`
    //     )
    //     .parent('body')
    //     .title('Add to Group')
    //     .textContent('Add to an existing group or create one')
    //     .ok('Add')
    //     .cancel('Cancel')
    // );
    
    var parentEl = angular.element(document.body);
       this.$mdDialog.show({
         parent: parentEl,
         targetEvent: this.originatorEvent,
         template:
           `<md-dialog aria-label="List dialog">
             <md-dialog-content>
               <md-input-container>
               <label>State</label>
               <md-select>
                 <md-option value="Group 1">
                   group 1
                 </md-option>
                 <md-option value="Group 2">
                   group 2
                 </md-option>
               </md-select>
             </md-input-container>
             </md-dialog-content>
             <md-dialog-actions>
               <md-button ng-click="closeDialog()" class="md-primary">
                 Close Dialog
               </md-button>
             </md-dialog-actions>
           </md-dialog>`,
         locals: {
           items: []
         },
         controller: DeviceListCtrl
      });
    
    this.originatorEvent = null;
  }
}

DeviceListCtrl.$inject = ['$rootScope', '$mdSidenav', '$mdDialog', 'bulbService'];


export {
  DeviceListCtrl
};
