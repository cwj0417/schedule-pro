import { app, BrowserWindow, globalShortcut, ipcMain, Notification, TouchBar, Menu, MenuItemConstructorOptions, dialog } from 'electron'
import mainPreload from '@/preload/mainPage.ts'
// import stickyPreload from '@/preload/stickyPage.ts'
import mainPage from '@/renderer/index.html#/home'
import timerPage from '@/renderer/index.html#/timer'
import schedulePage from '@/renderer/index.html#/schedule'
import inspirationPage from '@/renderer/index.html#/inspiration'
import stickiesPage from '@/renderer/index.html#/stickies'
import settingsPage from '@/renderer/index.html#/settings'
import { BrowserWindowConstructorOptions } from 'electron/main'
import { keyToAccelerator, userPath, getUserConf, useUserData } from './utils'
import { readdirSync, unlinkSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { autoUpdater } from "electron-updater"
import type { UpdateInfo } from 'electron-updater'
import { notification } from "../type"
import { toRaw } from 'vue'

import log from 'electron-log';

log.transports.file.level = 'debug'
autoUpdater.logger = log;
log.info('App starting...');

let mainWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null

const stickyMinFrame = {
  width: 400,
  height: 360,
}

autoUpdater.on('checking-for-update', () => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'checking-for-update',
    })
  })
})
autoUpdater.on('update-available', (info: UpdateInfo) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'update-available',
      value: info,
    })
  })
})
autoUpdater.on('update-not-available', (info) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'update-not-available',
    })
  })
})
autoUpdater.on('error', (err) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'update-error',
      value: err,
    })
  })
})
autoUpdater.on('download-progress', (progressObj) => {
  // let log_message = "Download speed: " + progressObj.bytesPerSecond;
  // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'download-progress',
      value: progressObj,
    })
  })
})
autoUpdater.on('update-downloaded', (info) => {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'update-downloaded',
      value: info,
    })
  })
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
  width: 1120,
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
  [prop in 'main' | 'timer' | 'schedule' | 'inspiration' | 'settings']: {
    url: string,
    conf: BrowserWindowConstructorOptions
  }
} = {
  main: {
    url: mainPage,
    conf: {
      width: 1120,
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
  },
  settings: {
    url: settingsPage,
    conf: {
      width: 700,
      height: 650,
      frame: false,
      webPreferences: {
        preload: mainPreload,
        sandbox: false,
      }
    },
  }
}

// 所有页面都是同一个 index.html 的 hash 路由. Electron 45 起, 对仅 hash 不同的地址调用
// loadURL 会抛 ERR_FAILED(-2), 所以同文档切换改用 location.hash
const navigateTo = (win: BrowserWindow, url: string) => {
  const current = win.webContents.getURL()
  if (current === url) return
  const [currentPath, ...currentHashParts] = current.split('#')
  const [targetPath, ...targetHashParts] = url.split('#')
  // dev 下 vite 会把 /index.html 重定向成 /, 所以把 index.html 和它所在的目录视为同一文档
  const normalize = (p: string) => {
    const dir = p.replace(/index\.html$/, '')
    return dir.endsWith('/') ? dir : dir + '/'
  }
  if (normalize(currentPath) === normalize(targetPath)) {
    const hash = targetHashParts.join('#')
    if (hash && hash !== currentHashParts.join('#')) {
      win.webContents.executeJavaScript(`location.hash = ${JSON.stringify('#' + hash)}`)
        .catch((err) => log.error('[navigateTo] set hash failed', url, err))
    }
    return
  }
  win.loadURL(url).catch((err) => log.error('[navigateTo] loadURL failed', url, err))
}

function createWindow(type: keyof typeof windowConf = 'main') {
  // 对于设置窗口，检查是否已经存在
  if (type === 'settings') {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      // 如果设置窗口已经存在，则聚焦到它
      settingsWindow.focus()
      return
    }
    
    settingsWindow = new BrowserWindow({
      ...windowConf[type].conf,
      show: false,
      parent: mainWindow || undefined,
      modal: false,
    })
    
    // 当设置窗口关闭时，清空引用
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
    
    settingsWindow.once('ready-to-show', () => settingsWindow?.show())
    settingsWindow.loadURL(windowConf[type].url)
    return
  }

  if (mainWindow) {
    navigateTo(mainWindow, windowConf[type].url)
    // show() 对已可见的窗口不会提到前台, 必须显式 focus; macOS 上还要激活整个应用
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    if (process.platform === 'darwin') app.focus({ steal: true })
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
    const accelerator = key.map(keyToAccelerator).join('+')
    const registered = globalShortcut.register(accelerator, () => {
      log.info('[shortcut] trigger', accelerator, '->', windowName)
      if (windowName === 'main') {
        Object.values(stickyWindows).forEach(win => win.focus())
      }
      createWindow(windowName as any)
    })
    // 被其它实例/应用占用时 register 只会返回 false, 不会抛错
    log.info('[shortcut] register', accelerator, windowName, registered)
  }
  
  // 检查并启动自动备份
  if (userSettings.value.autoBackup) {
    setupAutoBackup()
  }
})

app.on('activate', () => {
  if (!mainWindow) createWindow()
})

app.on('before-quit', () => {
  isQuiting = true
  clearAutoBackup()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const template: MenuItemConstructorOptions[] = [
  {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'settings',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          createWindow('settings')
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
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

// 设置相关的 IPC 处理器
let userSettings = useUserData('settings', {
  theme: 'system',
  autoBackup: true,  // 默认开启自动备份
  lastBackupTime: null
})

ipcMain.handle('exportData', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow || BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      title: '选择导出目标文件夹',
      properties: ['openDirectory', 'createDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      const path = require('path')
      const fse = require('fs-extra')
      const targetDir = path.join(result.filePaths[0], 'schedule-pro-appdata')
      // 创建 appdata 文件夹（如果不存在）
      fse.ensureDirSync(targetDir)
      // 复制 userPath 内容到目标 appdata 文件夹
      fse.copySync(userPath, targetDir)
      return true
    }
    return false
  } catch (error) {
    console.error('导出数据失败:', error)
    return false
  }
})

ipcMain.handle('importData', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow || BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0], {
      title: '选择导入源文件夹',
      properties: ['openDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      const fse = require('fs-extra')
      const sourceDir = result.filePaths[0]
      // 清空 userPath 文件夹
      fse.emptyDirSync(userPath)
      // 复制所选文件夹内容到 userPath
      fse.copySync(sourceDir, userPath)
      // 自动重启应用
      app.relaunch()
      app.exit(0)
      return true
    }
    return false
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
})

ipcMain.handle('createBackup', async () => {
  return await performBackup()
})

ipcMain.handle('restoreData', async () => {
  try {
    const path = require('path')
    const fse = require('fs-extra')
    
    const backupDir = path.join(app.getPath('userData'), 'backup')
    
    // 检查备份文件夹是否存在
    if (!fse.existsSync(backupDir)) {
      return { success: false, message: '没有找到备份文件夹' }
    }
    
    // 检查备份文件夹是否为空
    const backupFiles = fse.readdirSync(backupDir)
    if (backupFiles.length === 0) {
      return { success: false, message: '备份文件夹为空' }
    }
    
    // 保存当前的备份时间和自动备份设置
    const currentBackupTime = userSettings.value.lastBackupTime
    const currentAutoBackup = userSettings.value.autoBackup
    
    // 清空 userPath 文件夹
    fse.emptyDirSync(userPath)
    
    // 复制备份到 userPath
    fse.copySync(backupDir, userPath)
    
    // 恢复备份时间和自动备份设置
    userSettings.value.lastBackupTime = currentBackupTime
    userSettings.value.autoBackup = currentAutoBackup
    
    // 自动重启应用
    app.relaunch()
    app.exit(0)
    
    return { success: true }
  } catch (error) {
    console.error('恢复数据失败:', error)
    return { success: false, message: '恢复数据失败: ' + String(error) }
  }
})

ipcMain.handle('checkBackupStatus', () => {
  try {
    const path = require('path')
    const fse = require('fs-extra')
    
    const backupDir = path.join(app.getPath('userData'), 'backup')
    
    // 检查备份文件夹是否存在且不为空
    const hasBackup = fse.existsSync(backupDir) && 
                     fse.readdirSync(backupDir).length > 0
    
    return {
      hasBackup,
      lastBackupTime: userSettings.value.lastBackupTime,
      autoBackup: userSettings.value.autoBackup
    }
  } catch (error) {
    console.error('检查备份状态失败:', error)
    return {
      hasBackup: false,
      lastBackupTime: null,
      autoBackup: userSettings.value.autoBackup
    }
  }
})

ipcMain.handle('setAutoBackup', async (event, enabled: boolean) => {
  try {
    userSettings.value.autoBackup = enabled
    
    // 如果启用自动备份，设置定时器
    if (enabled) {
      setupAutoBackup()
    } else {
      // 清除自动备份定时器
      clearAutoBackup()
    }
    
    return true
  } catch (error) {
    console.error('设置自动备份失败:', error)
    return false
  }
})

ipcMain.handle('getAutoBackup', () => {
  return userSettings.value.autoBackup || false
})

// 自动备份相关变量
let autoBackupInterval: NodeJS.Timeout | null = null

const performBackup = async () => {
  try {
    const path = require('path')
    const fse = require('fs-extra')
    
    const backupDir = path.join(app.getPath('userData'), 'backup')
    
    // 如果备份目录存在，先清空
    if (fse.existsSync(backupDir)) {
      fse.emptyDirSync(backupDir)
    } else {
      fse.ensureDirSync(backupDir)
    }
    
    // 复制当前数据到备份目录
    fse.copySync(userPath, backupDir)
    
    // 记录备份时间
    userSettings.value.lastBackupTime = Date.now()
    
    return true
  } catch (error) {
    console.error('执行备份失败:', error)
    return false
  }
}

const checkIfShouldBackup = async () => {
  try {
    const path = require('path')
    const fse = require('fs-extra')
    
    const backupDir = path.join(app.getPath('userData'), 'backup')
    
    // 检查是否有备份
    const hasBackup = fse.existsSync(backupDir) && 
                     fse.readdirSync(backupDir).length > 0
    
    // 如果没有任何备份，需要立即备份
    if (!hasBackup) {
      return true
    }
    
    // 检查上次备份时间
    const lastBackupTime = userSettings.value.lastBackupTime
    if (!lastBackupTime) {
      return true
    }
    
    // 检查是否超过24小时
    const now = Date.now()
    const timeDiff = now - lastBackupTime
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    return timeDiff > twentyFourHours
  } catch (error) {
    console.error('检查备份条件失败:', error)
    return false
  }
}

const setupAutoBackup = () => {
  // 清除现有的定时器
  clearAutoBackup()
  
  // 每12小时检查一次是否需要备份（第一次在12小时后执行）
  autoBackupInterval = setInterval(async () => {
    if (userSettings.value.autoBackup) {
      const shouldBackup = await checkIfShouldBackup()
      if (shouldBackup) {
        await performBackup()
      }
    }
  }, 12 * 60 * 60 * 1000) // 每12小时检查一次
}

const clearAutoBackup = () => {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval)
    autoBackupInterval = null
  }
}

ipcMain.on('setTheme', (event, theme: string) => {
  userSettings.value.theme = theme
  
  // 通知所有窗口主题变更
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('message', {
      type: 'themeChanged',
      value: theme
    })
  })
})

ipcMain.handle('getTheme', () => {
  return userSettings.value.theme
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

ipcMain.on('toggleFullscreen', (event) => {
  const curWindow = BrowserWindow.fromWebContents(event.sender)
  curWindow?.setSimpleFullScreen(!curWindow.isSimpleFullScreen())
})

ipcMain.on('setPin', (event, isPin) => {
  BrowserWindow.fromWebContents(event.sender)?.setAlwaysOnTop(isPin)
})

ipcMain.on('setTransparent', (event, isTransparent) => {
  const curWindow = BrowserWindow.fromWebContents(event.sender)
  if (curWindow) {
    if (isTransparent) {
      curWindow.setOpacity(0.7)
    } else {
      curWindow.setOpacity(1)
    }
  }
})

ipcMain.on('resizeStickyForFileMode', (event, isFileMode) => {
  const curWindow = BrowserWindow.fromWebContents(event.sender)
  if (curWindow) {
    const [width, height] = curWindow.getSize()
    if (isFileMode) {
      if (width < 700) curWindow.setSize(700, Math.max(height, 500))
    } else {
      if (width > stickyMinFrame.width) curWindow.setSize(stickyMinFrame.width, stickyMinFrame.height)
    }
  }
})

ipcMain.on('set-ignore-mouse-events', (event, ignore: boolean, options?: any) => {
  BrowserWindow.fromWebContents(event?.sender)?.setIgnoreMouseEvents(ignore, options)
})

ipcMain.on('removeCountDown', (event, id) => {
  notificationQ.splice(notificationQ.findIndex(i => i.id === id), 1)
  clearTimeout(notificationHandlers[id])
  delete notificationHandlers[id]
})

ipcMain.on('setStickyTitle', (event, args) => {
  if (stickiesConfig.value[args.key]) {
    const val = args.val || ''
    // 文件模式占位符直接作为 title 保存，不做正则截取
    if (val.startsWith('[file]')) {
      stickiesConfig.value[args.key].title = val
    } else {
      stickiesConfig.value[args.key].title = val.match(/\s?([^\n]+)/)?.[1] ?? ''
    }
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

ipcMain.handle('findStickyByFilePath', (event, filePath: string) => {
  const FILE_PREFIX = '[file]'
  const target = FILE_PREFIX + filePath
  for (const [id, conf] of Object.entries(toRaw(stickiesConfig.value))) {
    if ((conf as any).title === target) {
      return id
    }
  }
  return null
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

// AI 设置相关
let aiSettings = useUserData('aiSettings', {
  selectedProvider: 'openai',
  tokens: {}
})

let fileModeSettings = useUserData('fileModeSettings', {
  paths: {} as { [filePath: string]: { name: string, command: string, params?: string[] }[] }
})

ipcMain.handle('getFileModeSettings', () => {
  return JSON.parse(JSON.stringify(fileModeSettings.value.paths || {}))
})

ipcMain.on('setFileModeSettings', (event, paths: { [filePath: string]: { name: string, command: string }[] }) => {
  fileModeSettings.value = { paths }
})

ipcMain.handle('ensureFilePathInSettings', (event, filePath: string) => {
  if (!fileModeSettings.value.paths) fileModeSettings.value.paths = {}
  if (!fileModeSettings.value.paths[filePath]) {
    fileModeSettings.value.paths = { ...fileModeSettings.value.paths, [filePath]: [] }
  }
  return true
})

// 打包后从 Finder/Dock 启动不继承 shell 的 PATH,补充常见可执行目录(npm 全局 bin 所在处)
function buildEnhancedPath(): string {
  const home = process.env.HOME || ''
  const extra = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    home && `${home}/.npm-global/bin`,
    home && `${home}/.volta/bin`,
    home && `${home}/.yarn/bin`,
    home && `${home}/.deno/bin`,
    home && `${home}/bin`,
  ].filter(Boolean) as string[]
  const nvmDir = home && join(home, '.nvm/versions/node')
  if (nvmDir && existsSync(nvmDir)) {
    for (const v of readdirSync(nvmDir)) extra.push(join(nvmDir, v, 'bin'))
  }
  return [...new Set(extra)].join(':')
}

ipcMain.handle('executeFileModeCommand', async (event, command: string, filePath: string) => {
  const { exec } = require('child_process')
  const env = { ...process.env }
  if (filePath) env.FILE_PATH = filePath
  env.PATH = `${process.env.PATH}:${buildEnhancedPath()}`
  const folder = filePath ? dirname(filePath) : undefined
  return new Promise((resolve, reject) => {
    exec(command, { cwd: folder, env, timeout: 30000 }, (error: any, stdout: string, stderr: string) => {
      if (error) {
        reject(new Error(JSON.stringify({ error: error.message, stderr, stdout })))
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
})

ipcMain.on('openSettingsWindow', () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    settingsWindow.webContents.send('message', { type: 'reloadFileModeSettings' })
  } else {
    createWindow('settings')
  }
})

ipcMain.handle('setAIToken', (event, args: { provider: string, token: string }) => {
  try {
    if (!aiSettings.value.tokens) {
      aiSettings.value.tokens = {}
    }
    aiSettings.value.tokens[args.provider] = args.token
    aiSettings.value.selectedProvider = args.provider
    return true
  } catch (error) {
    console.error('保存AI token失败:', error)
    return false
  }
})

ipcMain.handle('getAIToken', (event, provider: string) => {
  try {
    return aiSettings.value.tokens?.[provider] || ''
  } catch (error) {
    console.error('获取AI token失败:', error)
    return ''
  }
})

ipcMain.handle('getSelectedAIProvider', () => {
  try {
    return aiSettings.value.selectedProvider || 'openai'
  } catch (error) {
    console.error('获取选定的AI提供商失败:', error)
    return 'openai'
  }
})

ipcMain.on('createStickyWithContent', (event, args: { id: number, content: string }) => {
  const { id, content } = args
  ensureIdInStickiesConfig(id)
  const stickyData = useUserData('sticky' + id, { content: '' })
  stickyData.value.content = content
  createStickies(id)
})

ipcMain.handle('showOpenFileDialog', async (event, options?: { title?: string, filters?: any[], defaultPath?: string }) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow || BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  const result = await dialog.showOpenDialog(win, {
    title: options?.title || '选择文件',
    properties: ['openFile'],
    filters: options?.filters || [
      { name: '文本文件', extensions: ['md', 'txt', 'json', 'js', 'ts', 'vue', 'html', 'css', 'less', 'scss', 'yaml', 'yml', 'xml', 'csv'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    ...options
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('showFolderDialog', async (event, options?: { title?: string }) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow || BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  const result = await dialog.showOpenDialog(win, {
    title: options?.title || '选择文件夹',
    properties: ['openDirectory']
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('readFileContent', async (event, filePath: string) => {
  try {
    return readFileSync(filePath, { encoding: 'utf-8' })
  } catch (error) {
    throw error
  }
})

ipcMain.handle('listFilesInDir', async (event, dirPath: string) => {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true })
    return entries
      .filter(e => e.isFile())
      .map(e => ({ name: e.name, path: join(dirPath, e.name) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    throw error
  }
})

ipcMain.handle('writeFileContent', async (event, filePath: string, content: string) => {
  try {
    const fse = require('fs-extra')
    fse.ensureDirSync(require('path').dirname(filePath))
    writeFileSync(filePath, content, { encoding: 'utf-8' })
    return true
  } catch (error) {
    throw error
  }
})
