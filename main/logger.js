
// logging module
const bunyan = require("bunyan");
const config = require('./config').config;

// configure bunyan logging
let log = bunyan.createLogger({
  name: config.get('Logging.name')
});

exports.log = log;
