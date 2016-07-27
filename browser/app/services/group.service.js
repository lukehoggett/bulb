/* jshint esnext: true */
/* jshint node: true */
"use strict";
const ipc = require("electron").ipcRenderer;
const uuid = require("uuid");

class GroupService {
  constructor($timeout, bulbService) {
    this.$timeout = $timeout;
    this.bulbService = bulbService;
    this.groups = {};

    // request any stored groups from the main process
    this.getStoredGroups();

    // listening to messages from the main
    ipc.on("group.get.stored.reply", (event, group, uuid) => this.onGroupGetStoredReply(event, group, uuid));

  }

  getAll() {
    return this.groups;
  }

  get(uuid) {
    // console.info("GroupService() get", uuid, this.groups, this.groups[uuid]);
    return this.groups[uuid];
  }
  
  getDeviceGroupName(device) {
    let deviceGroupName = "";
    angular.forEach(this.getAll(), (group) => {
      if (group.devices.indexOf(device.uuid) !== -1) {
        deviceGroupName = group.name;
      }
    });
    return deviceGroupName;
  }
  
  add() {
    // console.info("GroupService: add:");
    let group = {};
    group.uuid = uuid.v4();
    group.name = "New Group";
    group.devices = [];

    // add to local variable
    this.groups[group.uuid] = group;
    // update persistent storage
    ipc.send('group.set.stored', group);
  }

  update(group) {
    console.info("GroupService update group");
    // update local variable
    this.groups[group.uuid] = group;
    // console.info("group update", this.groups);
    ipc.send('group.set.stored', group);
  }

  delete(group) {
    // remove from local variable
    delete this.groups[group.uuid];
    // update persistent storage
    ipc.send('group.delete.stored', group);
  }
  
  toggleConnection(group) {
    console.info(`BulbService: Handling connection to device `, group);
    let device = null;
    if (group.state == "disconnected") {
      angular.forEach(group.devices, (deviceUUID) => {
        device = this.bulbService.get(deviceUUID);
        this.bulbService.connect(device);
      });
    } else {
      angular.forEach(group.devices, (deviceUUID) => {
        device = this.bulbService.get(deviceUUID);
        this.bulbService.disconnect(device);
      });
    }
  }

  getStoredGroups() {
    // console.info("Requesting stored groups");
    ipc.send("group.get.stored", (event) => {
      // console.log("GroupService: get stored groups", event);
    });
  }

  // IPC listeners
  onGroupGetStoredReply(event, group) {
    console.log("GroupService: group.get.stored.reply", group);
    this.groups[group.uuid] = group;
  }

}

export {
  GroupService
};
