/* jshint esnext: true */
/* jshint node: true */
'use strict';


class CharacteristicCtrl {

  constructor($mdSidenav) {
    console.log("Characteristic Controller constructor");
    this.mdSidenav = $mdSidenav;
    
    
  }
  
  togglePane() {
    console.log("Toggling Pane", this.mdSidenav);
    this.mdSidenav('characteristic').toggle();
  }
  
}
export {
  CharacteristicCtrl
};
