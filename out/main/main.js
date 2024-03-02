"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const contextMenu = require("electron-context-menu");
let win;
async function handleDirectoryOpen() {
  try {
    const result = await electron.dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (!result.canceled) {
      return { filePaths: result.filePaths };
    } else {
      return { filePaths: [] };
    }
  } catch (error) {
    console.error("Error selecting music directory:", error);
    throw error;
  }
}
electron.ipcMain.on("create-directory", (event, directoryPath) => {
  try {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Directory created: ${directoryPath}`);
    event.returnValue = true;
  } catch (error) {
    console.error(`Error creating directory: ${directoryPath}`, error);
    event.returnValue = false;
  }
});
function createWindow() {
  win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    title: "Tune8",
    backgroundColor: "white",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path__namespace.join(__dirname, "../preload/preload.js")
    }
  });
  win.loadURL("http://localhost:5173");
  win.on("closed", () => win = null);
  win.once("ready-to-show", () => win.show());
}
electron.app.on("ready", () => {
  electron.protocol.interceptFileProtocol("file", (request, callback) => {
    const url = request.url.substr(7);
    callback({ path: url });
  });
  electron.ipcMain.handle("dialog:openDirectory", handleDirectoryOpen);
  contextMenu({
    window: win,
    prepend: (defaultActions, params, browserWindow) => [
      // Custom context menu items to prepend
      { label: "Custom Action 1", click: () => console.log("Custom Action 1 clicked") },
      { label: "Custom Action 2", click: () => console.log("Custom Action 2 clicked") },
      { type: "separator" },
      // Add a separator between custom and default actions
      ...defaultActions
      // Include default actions (e.g., 'Copy', 'Paste')
    ],
    append: (defaultActions, params, browserWindow) => [
      // Custom context menu items to append
      { label: "Custom Action 3", click: () => console.log("Custom Action 3 clicked") },
      { type: "separator" },
      // Add a separator between custom and default actions
      ...defaultActions
      // Include default actions (e.g., 'Copy', 'Paste')
    ]
    // Other options as needed
  });
  createWindow();
});
