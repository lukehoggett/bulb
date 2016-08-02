'use strict';

const DEVICE_STATE = 'device';
const GROUP_STATE = 'group';

class MenuService {

  constructor($log) {
    this.setState(DEVICE_STATE);
    this.$log = $log;
    
    this.$log.info('menuService state', this.getState());
  }

  getState() {
    return this.state;
  }

  setState(value) {
    this.state = value;
  }

}

export {
  MenuService
};
