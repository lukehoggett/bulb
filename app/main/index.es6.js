(function () {
    /* jshint esnext: true */
    let app = require('app');
    const ipcMain = require('electron').ipcMain;
    let crashReporter = require('crash-reporter');
    let BrowserWindow = require('browser-window');
    let noble = require('noble');

    crashReporter.start({
      productName: 'es6-ng-electron',
      companyName: 'FooBar',
      submitURL: 'http://localhost:3000/',
      autoSubmit: true
    });

    var mainWindow = null;

    ipcMain.on('crash', (event, arg) => {
        console.log("Crash", arg);
        process.crash(arg);
    });

    ipcMain.on('devTools', (event, arg) => {
        console.log("DevTools", arg);
        mainWindow.openDevTools();
    });

    app.on('window-all-closed', () => {
        // force app termination on OSX when mainWindow has been closed
        if (process.platform == 'darwin') {
            app.quit();
        }
    });

    app.on('ready', () => {
        console.log("App Ready");
        mainWindow = new BrowserWindow({
            // width: 1280,
            // height: 1200,
            // x: 1280,
            // y: 100
            width: 800,
            height: 600,
            x: 960,
            y: 100
        });
        
        mainWindow.loadURL('file://' + __dirname + '/../browser/index.html');
        mainWindow.webContents.on('did-finish-load', () => {
            console.log("Window Did Load");
            mainWindow.setTitle(app.getName());
            
            console.log("Setting noble state change listener");
            noble.on('stateChange', (state) => {
                console.log("Noble State Change", state);
                noble.startScanning();
                
            });
            
        });
        mainWindow.on('closed', () => {
            console.log("Window Closed");
            mainWindow = null;
        });
    });
}());
