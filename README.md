# Bulb Control

Control panel in electron for Playbulb


> This based on the work of Thorsten Hans https://github.com/ThorstenHans/electron-angular-es6/ commit `075fb4b0b36e750fed2291f5d87c455b481a3728`

## Installation

Prior to setup make sure that the global dependencies are met:
- `jspm`
- `gulp`
- `electron-prebuilt`
- `gulp-run-electron`????

By running:
```
npm install -g jspm gulp electron-prebuilt gulp-run-electron
```

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


## Run 



with sudo 
```sh
gulp transpile:main && sudo ./node_modules/electron-prebuilt/dist/electron main/dist/index.js --displaysize=sm | node_modules/bunyan/bin/bunyan
```

@TODO
without sudo if you have already run
```sh
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```
```sh
gulp transpile:main && ./node_modules/electron-prebuilt/dist/electron main/dist/index.js --displaysize=sm | node_modules/bunyan/bin/bunyan
```

## Caveats

```sh
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

Whenever you ran 'jspm init' correct line 2 of browser/config.js to:

```
baseURL: __dirname + "/",
```

Every time npm i is run need to run `./node_modules/.bin/electron-rebuild` from the app/ dir






## Todo
- [ ] convert css to sass
- [ ] process sass in gulp
- [ ] promisify pingback from renderer
- [/] handle group connection 
- [ ] get gulp tasks running electron
- [ ] effect and color previews in device and group lists
- [x] refactor to Angular 1.5+ components
- [ ] refactor to Angular 2 with TypeScript
