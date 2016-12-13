System.config({
  baseURL: __dirname + "/",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*",
    "bower:*": "jspm_packages/bower/*"
  },

  map: {
    "angular": "github:angular/bower-angular@1.5.8",
    "angular-animate": "github:angular/bower-angular-animate@1.5.8",
    "angular-localforage": "npm:angular-localforage@1.3.2",
    "angular-material": "github:angular/bower-material@1.1.1",
    "angular-material-icons": "npm:angular-material-icons@0.7.1",
    "angular-order-object-by": "bower:angular-order-object-by@1.3.0",
    "angular-route": "github:angular/bower-angular-route@1.5.8",
    "angular-ui-router": "github:angular-ui/angular-ui-router-bower@0.3.1",
    "babel": "npm:babel-core@5.8.38",
    "babel-runtime": "npm:babel-runtime@5.8.38",
    "brianpkelley/md-color-picker": "github:brianpkelley/md-color-picker@develop",
    "core-js": "npm:core-js@1.2.7",
    "defunctzombie/node-uuid": "github:kelektiv/node-uuid@3.0.1",
    "kelektiv/node-uuid": "github:kelektiv/node-uuid@3.0.1",
    "md-color-picker": "github:brianpkelley/md-color-picker@develop",
    "mdi": "npm:mdi@1.7.22",
    "mozilla/localForage": "github:localForage/localForage@1.4.3",
    "ocombe/angular-localForage": "github:ocombe/angular-localForage@1.3.1",
    "tinycolor2": "npm:tinycolor2@1.4.1",
    "bower:angular-order-object-by@1.3.0": {
      "angular": "bower:angular@1.5.8"
    },
    "github:angular-ui/angular-ui-router-bower@0.3.1": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-animate@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-aria@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-angular-route@1.5.8": {
      "angular": "github:angular/bower-angular@1.5.8"
    },
    "github:angular/bower-material@1.1.1": {
      "angular": "github:angular/bower-angular@1.5.8",
      "angular-animate": "github:angular/bower-angular-animate@1.5.8",
      "angular-aria": "github:angular/bower-angular-aria@1.5.8",
      "css": "github:systemjs/plugin-css@0.1.32"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.4.1"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-events@0.1.1": {
      "events": "npm:events@1.0.2"
    },
    "github:jspm/nodelibs-os@0.1.0": {
      "os-browserify": "npm:os-browserify@0.1.2"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.9"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "npm:acorn@1.2.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:amdefine@1.0.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "module": "github:jspm/nodelibs-module@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:angular-localforage@1.3.2": {
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "localforage": "npm:localforage@1.4.3",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:angular-material-icons@0.7.1": {
      "angular": "npm:angular@1.5.8"
    },
    "npm:assert@1.4.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.38": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.8",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.7": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:core-util-is@1.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:es3ify@0.1.4": {
      "esprima-fb": "npm:esprima-fb@3001.1.0-dev-harmony-fb",
      "jstransform": "npm:jstransform@3.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "through": "npm:through@2.3.8"
    },
    "npm:esprima-fb@15001.1001.0-dev-harmony-fb": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:esprima-fb@3001.1.0-dev-harmony-fb": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:falafel@1.2.0": {
      "acorn": "npm:acorn@1.2.2",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "foreach": "npm:foreach@2.0.5",
      "isarray": "npm:isarray@0.0.1",
      "object-keys": "npm:object-keys@1.0.11"
    },
    "npm:immediate@3.0.6": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:inline-process-browser@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "falafel": "npm:falafel@1.2.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "through2": "npm:through2@0.6.5"
    },
    "npm:jstransform@3.0.0": {
      "base62": "npm:base62@0.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "esprima-fb": "npm:esprima-fb@3001.1.0-dev-harmony-fb",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "source-map": "npm:source-map@0.1.31"
    },
    "npm:lie@3.0.2": {
      "es3ify": "npm:es3ify@0.1.4",
      "immediate": "npm:immediate@3.0.6",
      "inline-process-browser": "npm:inline-process-browser@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "unreachable-branch-transform": "npm:unreachable-branch-transform@0.3.0"
    },
    "npm:localforage@1.4.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "lie": "npm:lie@3.0.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:os-browserify@0.1.2": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.9": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:readable-stream@1.0.34": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.2",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:recast@0.10.43": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "ast-types": "npm:ast-types@0.8.15",
      "esprima-fb": "npm:esprima-fb@15001.1001.0-dev-harmony-fb",
      "os": "github:jspm/nodelibs-os@0.1.0",
      "private": "npm:private@0.1.6",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "source-map": "npm:source-map@0.5.6"
    },
    "npm:source-map@0.1.31": {
      "amdefine": "npm:amdefine@1.0.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:source-map@0.5.6": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.0.34"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:through2@0.6.5": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "readable-stream": "npm:readable-stream@1.0.34",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "xtend": "npm:xtend@4.0.1"
    },
    "npm:through@2.3.8": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:tinycolor2@1.4.1": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:unreachable-branch-transform@0.3.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "esmangle-evaluator": "npm:esmangle-evaluator@1.0.1",
      "recast": "npm:recast@0.10.43",
      "through2": "npm:through2@0.6.5"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    }
  }
});
