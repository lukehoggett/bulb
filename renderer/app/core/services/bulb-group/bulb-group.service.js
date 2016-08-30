'use strict';

const ipc = require('electron').ipcRenderer;
const uuid = require('uuid');

class BulbGroupService {

  constructor($timeout, bulbDeviceService, $log, C) {
    'ngInject';
    this.$timeout = $timeout;
    this.bulbDeviceService = bulbDeviceService;
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
    this.$log.info(`BulbService: Handling group connection to device `, group);

    // remove undiscovered devices before requesting connection/disconnection from main, cloning group and its children
    let groupDevicesClone = Array.from(group.devices);
    let groupClone = Object.assign({}, group);
    groupClone.devices = groupDevicesClone;
    this.$log.debug('groupConeDevices', groupDevicesClone, groupClone);
    angular.forEach(groupClone.devices, (deviceUUID, index) => {
      if (!this.bulbDeviceService.get(deviceUUID).peripheral.discovered) {
        groupClone.devices.splice(index, index + 1);
      }
    });

    let channel = '';
    switch (groupClone.state) {
      case this.C.DISCONNECTED:
        channel = this.C.IPC_GROUP_CONNECT;
        break;
      case this.C.CONNECTED:
        channel = this.C.IPC_GROUP_DISCONNECT;
        break;
    }
    ipc.send(channel, groupClone);
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
  BulbGroupService
};
