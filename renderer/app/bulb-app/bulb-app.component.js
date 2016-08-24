'use strict';

export function bulbAppComponent() {
  let component = {
    scope: {},
    restrict: 'EA',
    templateUrl: 'app/bulb-app/bulb-app.views/bulb-app.view.html',
    controller: BulbAppController,
    controllerAs: '$ctrl',
    bindToController: true
  };
  return component;
}

const ipc = require('electron').ipcRenderer;

class BulbAppController {

  constructor($mdToast, $log, C) {
    this.C = C;
    this.toast = $mdToast;
    this.$log = $log;

    ipc.on(this.C.IPC_ERROR, (event, message) => {
      this.$log.info('Error:', message);
      this.showErrorToast(message);
    });
  }

  showErrorToast(message) {
    this.toast.show(
      this.toast.simple()
      .textContent(message)
      .position('bottom left')
      .hideDelay(5000)
    );
  }

  navSelect(item) {
    if (item.id === 1) {
      this.showDevices();
    } else if (item.id === 2) {

    }
  }

}
