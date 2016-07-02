/* jshint esnext: true */
/* jshint node: true */
"use strict";

const DEVICE_STATE = 'device';
const GROUP_STATE = 'group';

class MenuService {
  
    constructor() {
      this.setState(GROUP_STATE);
      
      console.info("menuService state", this.getState());
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
