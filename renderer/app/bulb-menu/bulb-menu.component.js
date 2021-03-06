'use strict';

export function bulbMenuComponent() {
  let component = {
    scope: {},
    restrict: 'EA',
    templateUrl: 'app/bulb-menu/bulb-menu.views/bulb-menu.view.html',
    controller: BulbMenuController,
    controllerAs: '$ctrl',
    bindToController: true
  };
  return component;
}

class BulbMenuController {
  constructor($rootScope, $state, $log) {
    this.menuItems = [{
      id: 1,
      name: 'device',
      title: 'Devices',
      icon: 'lightbulb_outline'
    }, {
      id: 2,
      name: 'group',
      title: 'Groups',
      icon: 'group_work'
    }];
  }
}
