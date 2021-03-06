'use strict';

export function bulbDeviceListComponent() {
  let component = {
    scope: {},
    restrict: 'EA',
    templateUrl: 'app/bulb-device-list/bulb-device-list.views/bulb-device-list.view.html',
    controller: BulbDeviceListController,
    controllerAs: '$ctrl',
    bindToController: true
  };
  return component;
}


class BulbDeviceListController {

  constructor($rootScope, $mdDialog, bulbDeviceService, $log, C) {
    this.$rootScope = $rootScope;
    this.C = C;
    this.$mdDialog = $mdDialog;
    this.bulbDeviceService = bulbDeviceService;
    this.$log = $log;

    this.originatorEvent;
  }

  selectDevice(device) {
    this.$log.log('DeviceListCtrl: selectDevice', device);
    this.$rootScope.$broadcast('device_selected', device.uuid);
  }

  getCharacterisics(device) {
    this.$log.log('list get characteristics', device);
    this.bulbDeviceService.getCharacteristics(device.uuid);
  }

  updateDeviceName(uuid) {
    this.$log.log('updateDeviceName', uuid, this.bulbDeviceService.devices[uuid]);
    // send update command to main process
    this.bulbDeviceService.setCharacteristic(uuid, this.bulbDeviceService.devices[uuid].name, 'name');
  }

  openMoreMenu($mdOpenMenu, $event) {
    this.$log.info('list: openMoreMenu', $mdOpenMenu, $event);
    this.originatorEvent = $event;
    $mdOpenMenu($event);
  }

  addToGroupClick(device) {
    this.$log.info('list: addToGroup', device);
  }

  addToGroup(device) {
    this.$log.info('list: addToGroup', device);
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
      template: `<md-dialog aria-label="List dialog">
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
      controller: BulbDeviceListController
    });

    this.originatorEvent = null;
  }

  isEditDisabled(device) {
    return !(device.peripheral.state === this.C.CONNECTED) && (device.characteristics.length === 0);
  }
}
