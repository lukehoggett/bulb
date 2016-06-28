/* jshint esnext: true */
/* jshint node: true */
'use strict';


class MenuCtrl {

  constructor() {
    this.menuItems = [{
      id: 1,
      name: "devices",
      title: "Devices",
      icon: "lightbulb_outline"
    }, {
      id: 2,
      name: "groups",
      title: "Groups",
      icon: "group_work"
    }];
  }
  
  navSelect(item) {
    console.info("menu: navSelect", item);
  }

}
// MenuCtrl.$inject = [''];
export {
  MenuCtrl
};
