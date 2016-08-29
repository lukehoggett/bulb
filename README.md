# Bulb Control

Control panel in Electron for Playbulb

## Installation


### Dev

Prior to setup make sure that the global dependencies are met:
├── babel-cli@6.11.4
├── bower@1.7.9
├── bunyan@1.8.1
├── eslint@3.2.2
├── gulp@3.9.1
├── node-gyp@3.4.0
└── npm@3.10.5

```
npm -g i babel-cli@ bower bunyan eslint gulp node-gyp npm
```

then `npm i`

also need `jspm registry create bower jspm-bower-endpoint` for jspm 

Whenever you run `npm install` you need to run
```
./node_modules/.bin/electron-rebuild
```
you may need to first run (if it isn't installed)
@todo work out whether it should be installed as a dependency or a dev dependency or globally 
```
npm install --save-dev electron-rebuild`
```

Need to run `npm install` in the `app/` dir, and then fix the `baseUrl` in `app/browser/config.json` for jspm

### Distribution

## Run 

```
npm run sm|md|lg|full
```

## Caveats

Trying to set Linux capabilities 
```sh
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

Whenever you ran 'jspm init' correct line 2 of browser/config.js to: (unless you run as part of npm i, npm update still will need this fix)

```
baseURL: __dirname + "/",
```

When `npm i` is run may need to run `./node_modules/.bin/electron-rebuild` from the app/ dir






## Todo
- [x] convert css to sass
- [x] process sass in gulp
- [/] promisify
- [x] handle group connection 
- [x] store device color or effect state in cache
- [ ] store group color or effect state in cache
- [ ] get gulp tasks running electron
- [ ] effect and color previews in device and group lists
- [x] refactor to Angular 1.5+ components
- [ ] add timers
- [ ] building packages for distribution
- [ ] refactor to Angular 2 with TypeScript
