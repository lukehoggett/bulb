'use strict';

/**
 * EVENTS
 */

// process
export const PROCESS_UNCAUGHT_EXCEPTION = 'uncaughtException';

// app
export const APP_READY = 'ready';
export const APP_WINDOW_ALL_CLOSED = 'window-all-closed';
export const APP_QUIT = 'quit';

// window
export const WINDOW_READY_TO_SHOW = 'ready-to-show';
export const WINDOW_CLOSED = 'closed';
export const WINDOW_UNRESPONSIVE = 'unresponsive';

// wenContents
export const WEBCONTENTS_DID_FINISH_LOAD = 'did-finish-load';
export const WEBCONTENTS_CRASHED = 'crashed';

// IPC from renderer
export const IPC_SCAN_START = 'scan.start';
export const IPC_SCAN_STOP = 'scan.stop';
export const IPC_DEVICE_CONNECT = 'device.connect';
export const IPC_DEVICE_DISCONNECT = 'device.disconnect';
export const IPC_DEVICE_CHARACTERISTICS_GET = 'device.characteristics.get';
export const IPC_DEVICE_CHARACTERISTIC_SET = 'device.characteristic.set';
export const IPC_DEVICE_GET = 'device.get';
export const IPC_DEVICE_GET_CACHED = 'device.get.cached';
export const IPC_DEVICE_SET_CACHED = 'device.set.cached';
export const IPC_DEV_TOOLS_OPEN = 'dev.tools.open';
export const IPC_GROUP_CONNECT = 'group.connect';
export const IPC_GROUP_DISCONNECT = 'group.disconnect';
export const IPC_GROUP_SET_CACHED = 'group.set.cached';
export const IPC_GROUP_DELETE_CACHED = 'group.delete.cached';
export const IPC_GROUP_GET_CACHED = 'group.get.cached';

// IPC from main
export const IPC_SCANNING_START = 'scanning.start';
export const IPC_SCANNING_STOP = 'scanning.stop';
export const IPC_DEVICE_GET_CACHED_REPLY = 'device.get.cached.reply';
export const IPC_GROUP_GET_CACHED_REPLY = 'group.get.cached.reply';
export const IPC_DEVICE_DISCOVERED = 'device.discovered';
export const IPC_DEVICE_CONNECTED = 'device.connected';
export const IPC_DEVICE_DISCONNECTED = 'device.disconnected';
export const IPC_GROUP_CONNECTED = 'group.connected';
export const IPC_GROUP_DISCONNECTED = 'group.disconnected';
export const IPC_ERROR = 'error';
export const IPC_CRASH = 'crash';

// NOBLE
export const NOBLE_DISCOVER = 'discover';
export const NOBLE_STATE_CHANGE = 'sateChange';
export const NOBLE_SCAN_START = 'scanStart';
export const NOBLE_SCAN_STOP = 'scanStop';
export const NOBLE_DISCONNECT = 'disconnect';
export const NOBLE_WARNING = 'warning';

/**
 * OTHER
 */

// NOBLE
export const NOBLE_DISCOVER_TIMEOUT = 500;

// DISPLAY SIZE
export const DISPLAYSIZE_SMALL = 'sm';
export const DISPLAYSIZE_MEDIUM = 'md';
export const DISPLAYSIZE_LARGE = 'lg';
export const DISPLAYSIZE_FULL = 'full';

// DEVICE && GROUP
export const CONNECTED = 'connected';
export const DISCONNECTED = 'disconnected';

// peripheral service UUIDs
export const SERVICE_UUID_COLOR = 'ff00';
export const SERVICE_UUID_CANDLE = 'ff02';

// peripheral names
export const NAME_COLOR = 'color';
export const NAME_CANDLE = 'candle';

// effect or color types
export const TYPE_COLOR = 'color';
export const TYPE_EFFECT = 'effect';

// value of characteristic when effects are off
export const EFFECTS_OFF_VALUES = [0, 0, 0, 0, 255, 0, 1, 0];
