const electron = require('electron')

console.log('main page preload loaded');

const fs = require('fs')
const path = require('path')

electron.contextBridge.exposeInMainWorld('apis', {
    fs,
    path,
    electron,
    platform: process.platform,
    onMessage: (fn: any) => {
        electron.ipcRenderer.on('message', (event, text) => {
            fn?.(text)
        })
    }
})
