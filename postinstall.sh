#!/usr/bin/env sh

# add any new jspm packages
jspm install
# fix the config file's baseURL
sed -i -e 's|baseURL: "\(.*\)",|baseURL: __dirname + "/",|g' renderer/config.js
