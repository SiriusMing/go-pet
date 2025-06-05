//主进程

import { app, BrowserWindow, globalShortcut, ipcMain, screen} from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'

import { existsSync } from 'fs'

//const fs = require('fs');

//const isWin = process.platform === 'win32';

let mainWindow

// 立刻把两条实际路径输出来
const preloadPath  = join(__dirname, '../preload/index.js')

console.log('[DEBUG] preloadPath:', preloadPath);
console.log('[DEBUG] exists:', existsSync(preloadPath));

function createWindow() {
// 获取主显示器工作区尺寸（全屏展示）
const { width, height } = screen.getPrimaryDisplay().workAreaSize

// 创建全屏、无边框、透明的窗口
mainWindow = new BrowserWindow({
width,
height,
x: 0,
y: 0,
frame: false, // 无系统边框
transparent: true, // 背景全透明
resizable: false,
alwaysOnTop: true,
skipTaskbar: true,
// fullscreen 可选，如需要真正全屏方式可以添加 fullscreen: true,
fullscreenable: false,
focusable: false, // 默认不聚焦（辅助鼠标穿透）
icon: join(__dirname, '../../resources/icon.png'),
backgroundColor: '#00000000',
webPreferences: {
preload: path.join(__dirname, '../preload/index.js'),
contextIsolation: true,
nodeIntegration: false,  // 必须为 false，确保渲染进程无法直接访问 Node.js 模块
//禁用同源 允许跨域
webSecurity: false,
//禁止build环境使用Devtool
devTools: is.dev ? true : false,
sandbox: false
}
})



// 初始设置窗口忽略鼠标事件，实现点击穿透
mainWindow.setIgnoreMouseEvents(true, { forward: true })

mainWindow.once('ready-to-show', () => {
mainWindow.show()
})

// 根据环境加载 URL 或本地文件
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
} else {
mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

// 退出应用的 IPC 事件
ipcMain.on('exit-app', () => {
app.quit()
})

//快捷键

globalShortcut.register('CommandOrControl+Shift+i', function ()
{
  mainWindow.webContents.openDevTools()
})


// 切换鼠标事件状态的 IPC 事件
ipcMain.on('set-ignore-mouse-events', (_, ignore) => {
mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
// 切换 focusable 状态，保证需要交互时窗口能接收事件
mainWindow.setFocusable(!ignore)
})
}

app.whenReady().then(() => {
electronApp.setAppUserModelId('com.electron.dogpet')
createWindow()

app.on('activate', () => {
if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
})


const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// 判断平台
const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'

// 这里你应该写你的 chat.py 的路径，不是 .vue 文件
const script = path.resolve(__dirname, '../../src/renderer/components/chat/1.py') // 改成你的实际脚本名！

ipcMain.on('launch-python', (_e, feature) => {
  if (feature !== 'chat') return   // 这里只处理 Chat
  
  if (!fs.existsSync(script)) {
    console.error('[Python-GUI] script not found:', script)
    return
  }
  // 判断 Python 解释器名
  let pythonCmd = 'python3' // 推荐用 python3，兼容性更好
  if (isWin) pythonCmd = 'python'
  // 也可以写绝对路径，或者读取环境变量
  
  // 跨平台启动
  spawn(pythonCmd, [script], {
    detached: true,
    stdio: 'ignore'
  }).unref()
})

