import {app, BrowserWindow, ipcMain, dialog, protocol} from 'electron'
import * as path from 'path'
const contextMenu = require('electron-context-menu')
import fs from 'fs'

let win;

async function handleDirectoryOpen() {
    try {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        if (!result.canceled) {
            return { filePaths: result.filePaths };
        } else {
            return { filePaths: [] };
        }
    } catch (error) {
        console.error('Error selecting music directory:', error);
        throw error;
    }
}
ipcMain.on('create-directory', (event, directoryPath) => {
    try {
        // Create the directory
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`Directory created: ${directoryPath}`);
        event.returnValue = true;
    } catch (error) {
        // Handle error if directory creation fails
        console.error(`Error creating directory: ${directoryPath}`, error);
        event.returnValue = false;
    }
});

function createWindow(){
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        title: 'Tune8',
        backgroundColor: "white",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "../preload/preload.js")
        }
    })

    win.loadURL("http://localhost:5173")
    // win.loadFile(path.join(__dirname, '../renderer/index.html'))
    win.on('closed', () => win = null)
    win.once('ready-to-show', () => win.show())
}

app.on('ready', () => {
    protocol.interceptFileProtocol('file', (request, callback) => {
        const url = request.url.substr(7); // Strip 'file://' from the beginning
        callback({ path: url });
    });

    ipcMain.handle('dialog:openDirectory', handleDirectoryOpen);
    contextMenu({
        window: win,
        prepend: (defaultActions, params, browserWindow) => [
            // Custom context menu items to prepend
            { label: 'Custom Action 1', click: () => console.log('Custom Action 1 clicked') },
            { label: 'Custom Action 2', click: () => console.log('Custom Action 2 clicked') },
            { type: 'separator' }, // Add a separator between custom and default actions
            ...defaultActions, // Include default actions (e.g., 'Copy', 'Paste')
        ],
        append: (defaultActions, params, browserWindow) => [
            // Custom context menu items to append
            { label: 'Custom Action 3', click: () => console.log('Custom Action 3 clicked') },
            { type: 'separator' }, // Add a separator between custom and default actions
            ...defaultActions, // Include default actions (e.g., 'Copy', 'Paste')
        ],
        // Other options as needed
    });

    createWindow();
});