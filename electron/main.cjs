const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const isDev = !app.isPackaged;
  
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "Apartment Management System",
    // เพิ่มไอคอนได้ที่นี่ในอนาคต
  });

  if (isDev) {
    // ถ้ากำลังพัฒนา ให้โหลดจาก Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // ถ้า build แล้ว ให้โหลดไฟล์จาก dist
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
