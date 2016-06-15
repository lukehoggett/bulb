/* jshint esnext: true */
/* jshint node: true */
'use strict';


class MenuCtrl {

  constructor() {
    this.menuItems = [{
      id: 1,
      title: "Devices",
      icon: "lightbulb-outline"
    }, {
      id: 2,
      title: "Groups",
      icon: ""
    }]
  }

}
// MenuCtrl.$inject = [''];
export {
  MenuCtrl
};
