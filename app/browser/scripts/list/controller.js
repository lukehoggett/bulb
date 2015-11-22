/* jshint esnext: true */
/* jshint node: true */
'use strict';

const ipc = require('electron').ipcRenderer;


class ListCtrl {

    constructor() {
        console.log("ListCtrl", window.location);
        this.electronVersion = process.versions.electron;
    }

    doCrash() {
        console.log("Crash Reporting");
		ipc.send('crash', 'Something bad happened...');
    }

    openDevTools() {
        console.log("DevTools");
		ipc.send('devTools', null);
    }


}
export {
    ListCtrl
};
