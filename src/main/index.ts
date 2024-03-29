import { app, BrowserWindow, globalShortcut, ipcMain, Notification, TouchBar, Menu, MenuItemConstructorOptions, dialog } from 'electron'
import mainPreload from '@/preload/mainPage.ts'
// import stickyPreload from '@/preload/stickyPage.ts'
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

const stickyMinFrame = {
  width: 400,
  height: 360,
}

autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('message', {
    type: 'checking-for-update',
  });
})
autoUpdater.on('update-available', (info: UpdateInfo) => {
  mainWindow?.webContents.send('message', {
    type: 'update-available',
    value: info,
  });
})
autoUpdater.on('update-not-available', (info) => {
  mainWindow?.webContents.send('message', {
    type: 'update-not-available',
  });
})
autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('message', {
    type: 'update-error',
    value: err,
  });
})
autoUpdater.on('download-progress', (progressObj) => {
  // let log_message = "Download speed: " + progressObj.bytesPerSecond;
  // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  mainWindow?.webContents.send('message', {
    type: 'download-progress',
    value: progressObj,
  });
})
autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('message', {
    type: 'update-downloaded',
    value: info,
  });
});

const { TouchBarLabel, TouchBarButton, TouchBarSpacer, TouchBarColorPicker } = TouchBar

const countdownInterval = 60000 // 倒计时间隔
let isQuiting = false // quit的时候也会调用每个窗口的close事件, 所以要区别判断是否要进行便签的删除.

let stickiesConfig = useUserData('stickiesConfig', {}, (conf: any) => {
  (function sendMsg() {
    if (mainWindow) {
      mainWindow.webContents?.send('message', {
        type: 'stickesConfigChange',
        value: Object.entries(toRaw(conf)).map(([key, value]: any) => ({ ...value, id: key })).sort((a, b) => a.order - b.order),
      });
    }
  })()
})

const ensureIdInStickiesConfig = (id: number) => {
  if (!stickiesConfig.value[id]) {
    stickiesConfig.value[id] = {
      order: 0,
      backgroundColor: Math.ceil(Math.random() * 9).toString(),
      width: stickyMinFrame.width,
      height: stickyMinFrame.height,
      x: 0,
      y: 0,
      title: '',
      expended: true,
    }
    toTop(id)
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
    sandbox: false,
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
        sandbox: false,
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
        sandbox: false,
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
        sandbox: false,
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
        sandbox: false,
      }
    },
  }
}

function createWindow(type: keyof typeof windowConf = 'main') {

  if (mainWindow) {
    if (mainWindow?.webContents.getURL() !== windowConf[type].url) mainWindow!.loadURL(windowConf[type].url)
    mainWindow!.show()
  } else {
    mainWindow = new BrowserWindow({
      ...mainWindowConfig,
      show: false,
    })
    mainWindow.once('ready-to-show', mainWindow.show)
    mainWindow!.loadURL(windowConf[type].url)
    mainWindow?.on('close', () => {
      mainWindow = null;
    })
  }
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
      if (!stickyWindows[id]) return
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
    minWidth: stickyMinFrame.width,
    minHeight: stickyMinFrame.height,
    webPreferences: {
      preload: mainPreload,
      sandbox: false,
      webSecurity: false,
    },
    show: false
  })

  sticky.loadURL(stickiesPage + '?id=' + id + '&bg=' + backgroundColor)
  sticky.setTouchBar(new TouchBar({
    items: [new TouchBarColorPicker({
      change: (color) => {
        sticky.webContents.send('message', {
          type: 'changebg',
          value: color
        })
        stickiesConfig.value[id].backgroundColor = color
      }
    })]
  }))
  sticky.once('ready-to-show', sticky.show)
  sticky.on('close', () => {
    if (!isQuiting) {
      setTimeout(() => {
        delete stickyWindows[id]
        if (stickiesConfig.value[id].title) {
          stickiesConfig.value[id].expended = false
          mainWindow?.webContents.send('message', {
            type: 'activesticky',
            value: null
          })
        } else {
          delete stickiesConfig.value[id]
          unlinkSync(join(userPath, `sticky${id}.json`))
        }
      }, 350)
    }
  })
  sticky.on('resize', () => {
    setPosition()
  })
  sticky.on('move', () => {
    setPosition()
  })
  sticky.on('focus', () => {
    mainWindow?.webContents.send('message', {
      type: 'activesticky',
      value: id
    })
  })
  sticky.on('blur', () => {
    mainWindow?.webContents.send('message', {
      type: 'activesticky',
      value: null
    })
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

function switchToSticky(next: boolean) {
  const keys = Object.entries(toRaw(stickiesConfig.value)).sort((a: any, b: any) => a[1].order - b[1].order).map(i => i[0]).filter(i => stickyWindows[i])
  let index = null
  for (let i = 0; i < keys.length; i++) {
    if (stickyWindows[+keys[i]].isFocused()) {
      index = i;
      break;
    }
  }
  if (index === null) {
    index = next ? 0 : keys.length - 1
  } else {
    index = next ? index + 1 : index - 1
    if (index === -1) index = keys.length - 1
    if (index === keys.length) index = 0
  }
  keys.length && stickyWindows[+keys[+index]].focus()
}

app.whenReady().then(() => {
  createWindow()
  openStickies()
  let shortcuts: {
    [key: string]: any[]
  } = getUserConf('shortcuts')
  shortcuts.timer = shortcuts.timer ?? ["metaKey", "shiftKey", "i"]
  shortcuts.schedule = shortcuts.schedule ?? ["metaKey", "shiftKey", "j"]
  shortcuts.inspiration = shortcuts.inspiration ?? ["metaKey", "shiftKey", "l"]
  shortcuts.main = shortcuts.main ?? ["metaKey", "shiftKey", "h"]
  for (let [windowName, key] of Object.entries(shortcuts)) {
    globalShortcut.register(key.map(keyToAccelerator).join('+'), () => {
      if (windowName === 'main') {
        Object.values(stickyWindows).forEach(win => win.focus())
      }
      createWindow(windowName as any)
    })
  }
})

app.on('activate', () => {
  if (!mainWindow) createWindow()
})

app.on('before-quit', () => {
  isQuiting = true
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
      label: 'find prev active sticky',
      accelerator: 'CmdOrCtrl+[',
      click: () => {
        switchToSticky(false)
      },
    }, {
      label: 'find next active sticky',
      accelerator: 'CmdOrCtrl+]',
      click: () => {
        switchToSticky(true)
      },
    }, {
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
        autoUpdater.checkForUpdatesAndNotify()
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

ipcMain.handle('getNotificationQ', () => notificationQ)

ipcMain.on('setShortCut', (event, args: {
  window: keyof typeof windowConf,
  key: string[]
}) => {
  globalShortcut.register(args.key.map(keyToAccelerator).join('+'), () => {
    createWindow(args.window)
  })
})

ipcMain.on('removeShortCut', (event, args) => {
  if (!args.key.length) return
  globalShortcut.unregister(args.key.map(keyToAccelerator).join('+'))
})

ipcMain.on('checkforupdate', (event) => {
  autoUpdater.checkForUpdatesAndNotify()
})

ipcMain.on('quitAndInstall', (event) => {
  // If application quit was initiated by autoUpdater.quitAndInstall(), then before-quit is emitted after emitting close event on all windows and closing them.
  isQuiting = true
  autoUpdater.quitAndInstall()
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

ipcMain.on('hideWindow', () => {
  BrowserWindow.getFocusedWindow()?.close()
})

ipcMain.on('toggleFullscreen', () => {
  const curWindow = BrowserWindow.getFocusedWindow()
  curWindow?.setSimpleFullScreen(!curWindow.isSimpleFullScreen())
})

ipcMain.on('setPin', (event, isPin) => {
  BrowserWindow.getFocusedWindow()?.setAlwaysOnTop(isPin)
})

ipcMain.on('setTransparent', (event, isTransparent) => {
  const curWindow = BrowserWindow.getFocusedWindow()
  if (curWindow) {
    if (isTransparent) {
      curWindow.setOpacity(0.7)
    } else {
      curWindow.setOpacity(1)
    }
  }
})

ipcMain.on('set-ignore-mouse-events', (event, ...args) => {
  BrowserWindow.fromWebContents(event?.sender)?.setIgnoreMouseEvents(...args)
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

ipcMain.on('getStickiesConfig', () => mainWindow && mainWindow.webContents?.send('message', {
  type: 'stickesConfigChange',
  value: Object.entries(toRaw(stickiesConfig.value)).map(([key, value]: any) => ({ ...value, id: key })).sort((a, b) => a.order - b.order),
}))

ipcMain.on('openSticky', (event, stickyId) => {
  if (stickyWindows[stickyId]) {
    stickyWindows[stickyId].focus()
  } else {
    stickiesConfig.value[stickyId].expended = true
    createStickies(stickyId)
  }
})

const toTop = (stickyId: number) => {
  stickiesConfig.value[stickyId].order = Math.min(...Object.values(stickiesConfig.value).map((i: any) => i.order)) - 1
}

ipcMain.on('toTop', (event, stickyId) => {
  toTop(stickyId)
})

ipcMain.on('sortStickies', (event, sorted) => {
  sorted.forEach((sticky: any, order: number) => {
    stickiesConfig.value[sticky.id].order = order
  })
})

// ipcMain.on('retractSticky', (event, stickyId) => {
//   stickiesConfig.value[stickyId].expended = false
//   stickyWindows[stickyId].close()
//   delete stickyWindows[stickyId]
// })

ipcMain.on('changeStickyColor', (event, { stickyId, color }) => {
  stickiesConfig.value[stickyId].backgroundColor = color
  stickyWindows[stickyId].webContents.send('message', {
    type: 'changebg',
    value: color,
  })
})

ipcMain.on('deleteSticky', (event, stickyId) => {
  const res = dialog.showMessageBoxSync({
    message: '关闭后会丢失便签内容',
    type: 'info',
    buttons: ['取消', '删除便签']
  })
  if (res === 1) {
    removeSticky(stickyId)
  }
})

const removeSticky = (stickyId: number) => {
  stickyWindows[stickyId].close()
  setTimeout(() => { // prevent sticky close event not accessing to stickiesConfig
    delete stickiesConfig.value[stickyId]
    delete stickyWindows[stickyId]
    try { // prevent manually delete a non-content-sticky after newing
      unlinkSync(join(userPath, `sticky${stickyId}.json`))
    } catch (e) { }
  }, 350)
}

// autoUpdater.checkForUpdatesAndNotify()

let notificationQ: notification[] = []

let notificationHandlers: {
  [id: number]: NodeJS.Timeout
} = {}
