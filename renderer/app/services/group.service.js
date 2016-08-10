'use strict';

const ipc = require('electron').ipcRenderer;
const uuid = require('uuid');

class GroupService {
  
  constructor($timeout, bulbService, $log, C) {
    'ngInject';
    this.$timeout = $timeout;
    this.bulbService = bulbService;
    this.$log = $log;
    this.C = C;
    
    this.groups = {};
    
    // request any cached groups from the main process
    this.getCachedGroups();

    // listening to messages from the main
    ipc.on(C.IPC_GROUP_GET_CACHED_REPLY, (event, group, uuid) => this.onGroupGetCachedReply(event, group, uuid));

  }

  getAll() {
    return this.groups;
  }

  get(uuid) {
    // this.$log.info('GroupService() get', uuid, this.groups, this.groups[uuid]);
    return this.groups[uuid];
  }
  
  getDeviceGroupName(device) {
    let deviceGroupName = '';
    angular.forEach(this.getAll(), (group) => {
      if (group.devices.indexOf(device.uuid) !== -1) {
        deviceGroupName = group.name;
      }
    });
    return deviceGroupName;
  }
  
  add() {
    // this.$log.info('GroupService: add:');
    let group = {};
    group.uuid = uuid.v4();
    group.name = 'New Group';
    group.state = this.C.DISCONNECTED;
    group.devices = [];

    // add to local variable
    this.groups[group.uuid] = group;
    // update persistent storage
    ipc.send(this.C.IPC_GROUP_SET_CACHED, group);
  }

  update(group) {
    this.$log.info('GroupService update group');
    // update local variable
    this.groups[group.uuid] = group;
    // this.$log.info('group update', this.groups);
    ipc.send(this.C.IPC_GROUP_SET_CACHED, group);
  }

  delete(group) {
    // remove from local variable
    delete this.groups[group.uuid];
    // update persistent storage
    ipc.send(this.C.IPC_GROUP_DELETE_CACHED, group);
  }
  
  toggleConnection(group) {
    this.$log.info(`BulbService: Handling connection to device `, group);
    let device = null;
    this.$log.info('GroupService toggleConnection', group.state);
    if (group.state == this.C.DISCONNECTED) {
      this.$log.info('GroupService toggleConnection disconnected');
      ipc.send(this.C.IPC_GROUP_CONNECT, group);
      // angular.forEach(group.devices, (deviceUUID) => {
      //   device = this.bulbService.get(deviceUUID);
      //   this.bulbService.connect(device);
      // });
    } else {
      this.$log.info('GroupService toggleConnection connected');
      ipc.send(this.C.IPC_GROUP_DISCONNECT, group);
      // angular.forEach(group.devices, (deviceUUID) => {
      //   device = this.bulbService.get(deviceUUID);
      //   this.bulbService.disconnect(device);
      // });
    }
  }

  getCachedGroups() {
    ipc.send(this.C.IPC_GROUP_GET_CACHED);
  }

  // IPC listeners
  onGroupGetCachedReply(event, group) {
    this.$log.log('GroupService: onGroupGetCachedReply...', group);
    this.groups[group.uuid] = group;
  }

}

export {
  GroupService
};
