// logging module
import bunyan from 'bunyan';
import {
  config
} from './config';

// configure bunyan logging
let log = bunyan.createLogger({
  name: config.get('Logging.name')
});

exports.log = log;
