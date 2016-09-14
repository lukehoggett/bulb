import {log} from './logger';
import * as C from './constants';
import BulbSerializer from './bulb-serializer';
import Immutable from 'immutable';

let dataInstance = null;
export default class BulbData {
  constructor() {
    if (!dataInstance) {
      dataInstance = this;
    }
    log.debug('BulbStore.constructor() dataInstance', dataInstance);
    return dataInstance;
  }
}
