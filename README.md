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


## Caveat
Whenever you ran 'jspm init' correct line 2 of browser/config.js to:

```
baseURL: __dirname + "/",
```

Every time npm i is run need to run `./node_modules/.bin/electron-rebuild` from the app/ dir











----------------
original README (at time of fork):
----------------
# Sample App for Electron

For more details see the post on my blog [http://www.dotnet-rocks.com/2015/05/04/writing-an-electron-atom-shell-app-using-angular-and-es6/](http://www.dotnet-rocks.com/2015/05/04/writing-an-electron-atom-shell-app-using-angular-and-es6/)


## PreConditions for client

Ensure that the following node packages are installed on your system

 * jspm

you can install it using `npm i jspm -g`


## Install dependencies

After cloning the repo execute `npm i` in both subdirectories `app` and `server` to install all dependencies. For the client, `jspm install` will be invoked automatically as `npm postinstall` script!

## Creating the Electorn App package

Execute `gulp` in order to build the electron app.

The final electron app will be located as a zip file within the `dist` subfolder. Extract the ZIP file and start the electron app.

## Demonstrating CrashReporter

For demonstrating the `crash-reporter` you've to start the little `express` server from the `server` subfolder by invoking `node server.js` before crashing the app using the button...
=======
