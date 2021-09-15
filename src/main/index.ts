import { app, BrowserWindow, globalShortcut, ipcMain, Notification, TouchBar, Menu, MenuItemConstructorOptions, dialog } from 'electron'
import mainPreload from '@/preload/mainPage.ts'
import stickyPreload from '@/preload/stickyPage.ts'
import mainPage from '@/renderer/index.html#/home'
import timerPage from '@/renderer/index.html#/timer'
import schedulePage from '@/renderer/index.html#/schedule'
import inspirationPage from '@/renderer/index.html#/inspiration'
import stickiesPage from '@/renderer/index.html#/stickies'
import { BrowserWindowConstructorOptions } from 'electron/main'
import { keyToAccelerator, userPath, getUserConf, useUserData } from './utils'
import { readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { autoUpdater } from "electron-updater"
import type { UpdateInfo } from 'electron-updater'
import { notification } from "../type"
import { toRaw } from 'vue'

import log from 'electron-log';

log.transports.file.level = 'debug'
autoUpdater.logger = log;
log.info('App starting...');

let mainWindow: BrowserWindow | null = null

autoUpdater.on('checking-for-update', () => {
  mainWindow!.webContents.send('message', {
    type: 'checking-for-update',
  });
})
autoUpdater.on('update-available', (info: UpdateInfo) => {
  mainWindow!.webContents.send('message', {
    type: 'update-available',
    value: info,
  });
})
autoUpdater.on('update-not-available', (info) => {
  mainWindow!.webContents.send('message', {
    type: 'update-not-available',
  });
})
autoUpdater.on('error', (err) => {
})
autoUpdater.on('download-progress', (progressObj) => {
  // let log_message = "Download speed: " + progressObj.bytesPerSecond;
  // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
})
autoUpdater.on('update-downloaded', (info) => {
});

const { TouchBarLabel, TouchBarButton, TouchBarSpacer, TouchBarColorPicker } = TouchBar

const countdownInterval = 60000 // 倒计时间隔

let stickiesConfig = useUserData('stickiesConfig', {}, (conf: any) => {
  (function sendMsg() {
    if (mainWindow) {
      mainWindow.webContents?.send('message', {
        type: 'stickesConfigChange',
        value: Object.entries(toRaw(conf)).map(([key, value]: any) => ({ ...value, id: key })),
      });
    }
  })()
})

const ensureIdInStickiesConfig = (id: number) => {
  if (!stickiesConfig.value[id]) {
    stickiesConfig.value[id] = {
      backgroundColor: '#FCF4A7',
      width: 300,
      height: 400,
      x: 0,
      y: 0,
      title: '',
      expended: true,
    }
  }
}

const stickyWindows: {
  [id: number]: BrowserWindow
} = {}

let mainWindowConfig: BrowserWindowConstructorOptions = {
  width: 960,
  minWidth: 960,
  height: 552,
  minHeight: 552,
  frame: false,
  webPreferences: {
    preload: mainPreload,
  }
}

const windowConf: {
  [prop in 'main' | 'timer' | 'schedule' | 'inspiration']: {
    url: string,
    conf: BrowserWindowConstructorOptions
  }
} = {
  main: {
    url: mainPage,
    conf: {
      width: 960,
      minWidth: 960,
      height: 552,
      minHeight: 552,
      frame: false,
      webPreferences: {
        preload: mainPreload,
      }
    },
  },
  timer: {
    url: timerPage,
    conf: {
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        preload: mainPreload,
      }
    },
  },
  schedule: {
    url: schedulePage,
    conf: {
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        preload: mainPreload,
      }
    },
  },
  inspiration: {
    url: inspirationPage,
    conf: {
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        preload: mainPreload,
      }
    },
  }
}

function createWindow(type: keyof typeof windowConf = 'main') {

  if (mainWindow) {
    if (mainWindow!.webContents.getURL() !== windowConf[type].url) mainWindow!.loadURL(windowConf[type].url)
    mainWindow!.show()
  } else {
    mainWindow = new BrowserWindow(mainWindowConfig)
    mainWindow!.loadURL(windowConf[type].url)
    mainWindow?.on('close', () => {
      mainWindow = null;
    })
  }
  // sendStatusToWindow('test...')
}

function createStickies(id = Date.now()) {
  ensureIdInStickiesConfig(id)
  const { backgroundColor, width, height, x, y, expended } = stickiesConfig.value[id]
  if (!expended) return
  let setpositionhandler: NodeJS.Timeout
  const setPosition = () => {
    if (setpositionhandler) {
      clearTimeout(setpositionhandler)
    }
    setpositionhandler = setTimeout(() => {
      const { width, height, x, y } = sticky.getBounds()
      stickiesConfig.value[id] = {
        ...stickiesConfig.value[id],
        width,
        height,
        x,
        y,
      }
    }, 350)
  }
  const sticky = new BrowserWindow({
    frame: false,
    width,
    height,
    x,
    y,
    backgroundColor,
    webPreferences: {
      preload: stickyPreload,
    }
  })
  sticky.loadURL(stickiesPage + '?id=' + id)
  sticky.setTouchBar(new TouchBar({
    items: [new TouchBarColorPicker({
      change: (color) => {
        sticky.setBackgroundColor(color)
        stickiesConfig.value[id].backgroundColor = color
      }
    })]
  }))
  sticky.on('close', () => {
    stickiesConfig.value[id].expended = false
    delete stickyWindows[id]
  })
  sticky.on('resize', () => {
    setPosition()
  })
  sticky.on('move', () => {
    setPosition()
  })
  stickyWindows[id] = sticky
}

function openStickies() {
  readdirSync(userPath).forEach((dirname: string) => {
    const matched = /sticky(\d{13})\.json/.exec(dirname)
    if (matched) {
      createStickies(+matched[1])
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  openStickies()
  const shortcuts = getUserConf('shortcuts')
  for (let [windowName, key] of Object.entries(shortcuts)) {
    globalShortcut.register(key.map(keyToAccelerator).join('+'), () => {
      createWindow(windowName as any)
    })
  }
})

app.on('activate', () => {
  //
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const template: MenuItemConstructorOptions[] = [
  {
    role: 'appMenu'
  },
  {
    label: 'File',
    submenu: [{
      label: 'create stickies',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        createStickies()
      },
    },
    {
      role: 'toggleDevTools'
    },
    {
      role: 'close'
    },
    {
      label: 'check for updates',
      click: () => {
        autoUpdater.checkForUpdates()
      }
    },
    {
      label: 'gototo homepage',
      accelerator: 'CmdOrCtrl+Shift+H',
      click: () => {
        createWindow()
      }
    },
    ]
  },
  { role: 'editMenu' }
]

Menu.setApplicationMenu(Menu.buildFromTemplate(template))

ipcMain.handle('getUserPath', () => userPath)

ipcMain.handle('getVersion', () => app.getVersion())

ipcMain.on('setShortCut', (event, args: {
  window: keyof typeof windowConf,
  key: string[]
}) => {
  // console.log('set shortcuts', args)
  globalShortcut.register(args.key.map(keyToAccelerator).join('+'), () => {
    createWindow(args.window)
  })
})

ipcMain.on('removeShortCut', (event, args) => {
  // console.log('remove shortcuts', args)
  if (!args.key.length) return
  // console.log('unregister', args.key.map(keyToAccelerator).join('+'))
  globalShortcut.unregister(args.key.map(keyToAccelerator).join('+'))
})

ipcMain.on('addCountDown', (event, args) => {
  const { cd, content } = args
  const id = Date.now()
  notificationQ.push({
    id,
    createTime: id,
    cd,
    content,
    end: countdownInterval * cd + Date.now(),
  })
  notificationHandlers[id] = setTimeout(() => {
    new Notification({
      title: 'schedule pro',
      body: content,
    }).show()
    notificationQ.splice(notificationQ.findIndex(i => i.id === id), 1)
    delete notificationHandlers[id]
  }, countdownInterval * cd)
})

ipcMain.on('removeCountDown', (event, id) => {
  notificationQ.splice(notificationQ.findIndex(i => i.id === id), 1)
  clearTimeout(notificationHandlers[id])
  delete notificationHandlers[id]
})

ipcMain.on('setStickyTitle', (event, args) => {
  if (stickiesConfig.value[args.key]) {
    stickiesConfig.value[args.key].title = args.val.match(/\s?([^\n]+)/)?.[1] ?? ''
  }
})

ipcMain.handle('getNotificationQ', () => {
  return notificationQ
})

ipcMain.on('getStickiesConfig', () => mainWindow && mainWindow.webContents?.send('message', {
  type: 'stickesConfigChange',
  value: Object.entries(toRaw(stickiesConfig.value)).map(([key, value]: any) => ({ ...value, id: key })),
}))

ipcMain.on('openSticky', (event, stickyId) => {
  if (stickyWindows[stickyId]) {
    stickyWindows[stickyId].focus()
  } else {
    stickiesConfig.value[stickyId].expended = true
    createStickies(stickyId)
  }
})

ipcMain.on('retractSticky', (event, stickyId) => {
  stickiesConfig.value[stickyId].expended = false
  stickyWindows[stickyId].close()
  delete stickyWindows[stickyId]
})

ipcMain.on('deleteSticky', (event, stickyId) => {
  const res = dialog.showMessageBoxSync({
    message: '关闭后会丢失便签内容',
    type: 'info',
    buttons: ['取消', '删除便签']
  })
  if (res === 1) {
    stickyWindows[stickyId].close()
    delete stickiesConfig.value[stickyId]
    delete stickyWindows[stickyId]
    unlinkSync(join(userPath, `sticky${stickyId}.json`))
  }
})

autoUpdater.checkForUpdatesAndNotify()

let notificationQ: notification[] = []

let notificationHandlers: {
  [id: number]: NodeJS.Timeout
} = {}
