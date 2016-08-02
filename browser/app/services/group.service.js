'use strict';

const ipc = require('electron').ipcRenderer;
const uuid = require('uuid');

class GroupService {
  constructor($timeout, bulbService, $log) {
    this.$timeout = $timeout;
    this.bulbService = bulbService;
    this.$log = $log;
    
    this.groups = {};
    

    // request any stored groups from the main process
    this.getStoredGroups();

    // listening to messages from the main
    ipc.on('group.get.stored.reply', (event, group, uuid) => this.onGroupGetStoredReply(event, group, uuid));

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
    group.devices = [];

    // add to local variable
    this.groups[group.uuid] = group;
    // update persistent storage
    ipc.send('group.set.stored', group);
  }

  update(group) {
    this.$log.info('GroupService update group');
    // update local variable
    this.groups[group.uuid] = group;
    // this.$log.info('group update', this.groups);
    ipc.send('group.set.stored', group);
  }

  delete(group) {
    // remove from local variable
    delete this.groups[group.uuid];
    // update persistent storage
    ipc.send('group.delete.stored', group);
  }
  
  toggleConnection(group) {
    this.$log.info(`BulbService: Handling connection to device `, group);
    let device = null;
    group.state = 'disconnected';
    this.$log.info('GroupService toggleConnection', group.state);
    if (group.state == 'disconnected') {
      this.$log.info('GroupService toggleConnection disconnected');
      angular.forEach(group.devices, (deviceUUID) => {
        device = this.bulbService.get(deviceUUID);
        this.bulbService.connect(device);
      });
    } else {
      this.$log.info('GroupService toggleConnection connected');
      angular.forEach(group.devices, (deviceUUID) => {
        device = this.bulbService.get(deviceUUID);
        this.bulbService.disconnect(device);
      });
    }
  }

  getStoredGroups() {
    // this.$log.info('Requesting stored groups');
    ipc.send('group.get.stored', (event) => {
      // this.$log.log('GroupService: get stored groups', event);
    });
  }

  // IPC listeners
  onGroupGetStoredReply(event, group) {
    this.$log.log('GroupService: onGroupGetStoredReply...', group);
    this.groups[group.uuid] = group;
  }

}

export {
  GroupService
};
