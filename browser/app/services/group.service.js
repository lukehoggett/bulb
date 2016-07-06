/* jshint esnext: true */
/* jshint node: true */
"use strict";
const ipc = require("electron").ipcRenderer;
const uuid = require("uuid");

class GroupService {
    constructor($timeout) {
      this.$timeout = $timeout;
      
      this.groups = {};
      
      // request any stored groups from the main process
      this.getStoredGroups();
      
      // listening to messages from the main
      ipc.on("group.get.stored.reply", (event, group, uuid) => this.onGroupGetStoredReply(event, group, uuid));
      
    }
    
    getAll() {
      return this.groups;
    }
    
    get(groupId) {
      return this.groups[groupId];
    }
    
    add() {
      console.info("GroupService: add:");
      let group = {};
      group.uuid = uuid.v4();
      group.name = "New Group";
      group.devices = [];
      console.info("GroupService: add: new group", group);
      // add to local variable
      this.groups.push(group);
      // update persistent storage
      ipc.send('group.set.stored', group); 
    }
    
    update(group) {
      // update local variable
      this.groups[group.uuid] = group;
      console.info("update", this.groups);
      ipc.send('group.set.stored', group);
    }
    
    delete(group) {
      // remove from local variable
      delete this.groups[group.uuid];
      // update persistent storage
      ipc.send('group.delete.stored', group);
    }
    
    getStoredGroups() {
      console.info("Requesting stored groups");
      ipc.send("group.get.stored", (event) => {
        console.log("GroupService: get stored groups", event);
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
