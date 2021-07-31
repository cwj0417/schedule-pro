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

const { TouchBarLabel, TouchBarButton, TouchBarSpacer, TouchBarColorPicker } = TouchBar

let isQuiting = false // quit的时候也会调用每个窗口的close事件, 所以要区别判断是否要进行便签的删除.

let stickiesConfig = useUserData('stickiesConfig')
const ensureIdInStickiesConfig = (id: number) => {
  if (!stickiesConfig.value[id]) {
    stickiesConfig.value[id] = {
      backgroundColor: '#FCF4A7',
      width: 300,
      height: 400,
      x: 0,
      y: 0,
    }
  }
}

const windowConf: {
  [prop in 'main' | 'timer' | 'schedule' | 'inspiration']: {
    window: BrowserWindow | null,
    url: string,
    conf: BrowserWindowConstructorOptions
  }
} = {
  main: {
    window: null,
    url: mainPage,
    conf: {
      width: 800,
      height: 600,
      webPreferences: {
        preload: mainPreload,
      }
    },
  },
  timer: {
    window: null,
    url: timerPage,
    conf: {
      width: 800,
      height: 600,
      webPreferences: {
        preload: mainPreload,
      }
    },
  },
  schedule: {
    window: null,
    url: schedulePage,
    conf: {
      width: 800,
      height: 600,
      webPreferences: {
        preload: mainPreload,
      }
    },
  },
  inspiration: {
    window: null,
    url: inspirationPage,
    conf: {
      width: 800,
      height: 600,
      webPreferences: {
        preload: mainPreload,
      }
    },
  }
}

function createWindow(type: keyof typeof windowConf = 'main') {

  if (windowConf[type].window) {
    windowConf[type].window!.show()
  } else {
    windowConf[type].window = new BrowserWindow(windowConf[type].conf)
    windowConf[type].window!.loadURL(windowConf[type].url)
    windowConf[type].window?.on('close', () => {
      windowConf[type].window = null;
    })
  }
}

function createStickies(id = Date.now()) {
  ensureIdInStickiesConfig(id)
  const { backgroundColor, width, height, x, y } = stickiesConfig.value[id]
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
  sticky.on('close', (event) => {
    if (!isQuiting) {
      const res = dialog.showMessageBoxSync({
        message: '关闭后会丢失便签内容',
        type: 'info',
        buttons: ['取消', '删除便签']
      })
      if (res !== 1) {
        event.preventDefault()
      } else {
        delete stickiesConfig.value[id]
        unlinkSync(join(userPath, `sticky${id}.json`))
      }
    }
  })
  sticky.on('resize', () => {
    setPosition()
  })
  sticky.on('move', () => {
    setPosition()
  })
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
  createWindow()
})

app.on('before-quit', () => {
  isQuiting = true
})

app.on('window-all-closed', () => {
  isQuiting = false
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
      accelerator: 'Cmd+N',
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
    }
    ]
  }
]

Menu.setApplicationMenu(Menu.buildFromTemplate(template))

ipcMain.handle('getUserPath', () => {
  return userPath
})

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
  notificationQ.push({
    id: Date.now(),
    cd,
    content,
  })
})

autoUpdater.checkForUpdatesAndNotify()

type notification = {
  id: number,
  cd: number,
  content: string,
}

let notificationQ: notification[] = []

setInterval(() => {
  for (let index = 0; index < notificationQ.length; index++) {
    const notification = notificationQ[index]
    if (!notification.cd) {
      new Notification({
        title: 'title',
        body: notification.content,
      }).show()
      // 想想怎么移除
      notificationQ.splice(index, 1)
    } else {
      notificationQ[index].cd--
    }
  }
}, 60000)
