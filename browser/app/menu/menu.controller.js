/* jshint esnext: true */
/* jshint node: true */
'use strict';


class MenuCtrl {

  constructor(menuService) {
    
    this.menuService = menuService;
    
    this.menuItems = [{
      id: 1,
      name: "device",
      title: "Devices",
      icon: "lightbulb_outline"
    }, {
      id: 2,
      name: "group",
      title: "Groups",
      icon: "group_work"
    }];
  }
  
  navSelect(item) {
    console.info("menu: navSelect", item);
    this.menuService.setState(item.name);
    
  }

}
MenuCtrl.$inject = ['menuService'];
export {
  MenuCtrl
};
