const { contextBridge, ipcRenderer } = require('electron')

console.log("[PRELOAD] My custom preload loaded!!!")

// 确保暴露的 API 可以被渲染进程正确访问
contextBridge.exposeInMainWorld('electronAPI', {
  launchPython: (feature) => ipcRenderer.send('launch-python', feature),
  exitApp: () => ipcRenderer.send('exit-app'),
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  readCharacter: () => ipcRenderer.invoke('read-character'),
  writeCharacter: (characterName) => ipcRenderer.invoke('write-character', characterName)

})
