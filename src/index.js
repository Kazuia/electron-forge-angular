import { app, Tray, Menu, BrowserWindow } from 'electron';
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;
let force_quit=false;
const iconPath = path.join(__dirname, 'img/icon.ico');
const flagPath = path.join(__dirname, 'img/flags/');

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 960,
    icon: iconPath,
    resizable: true,
    frame: false,
    movable: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', function(e){
      if(!force_quit){
          e.preventDefault();
          mainWindow.hide();
      }
  });

  app.on('activate', function(){
      mainWindow.show();
  });


  /*// Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    mainWindow = null;
    tray = null;
  });*/

};

const createTray = () => {
  tray = new Tray(iconPath);
  let contextMenu = Menu.buildFromTemplate([
    {
      label: '1280x960',
      type: 'radio',
      checked: true
    },
    {
      label: '800x600',
      type: 'radio',
      click: function() {
        console.log('800x600 asked');
        console.log(mainWindow);
        mainWindow.width = 800;
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Langues',
      submenu: [
        {
          label: 'English',
          type: 'radio',
          icon: flagPath + 'uk.png',
          checked: true
        },
        {
          label: 'French',
          type: 'radio',
          icon: flagPath + 'france.png'
        }
      ]
    },
    {
      type: 'separator'
    },
    { label: 'Show',
      click: function() { mainWindow.show(); }
    },
    { label: 'Quit',
      click: function() { force_quit=true; app.quit(); }
    }
  ]);
  tray.setToolTip('EF-Angular');
  tray.setContextMenu(contextMenu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('ready', createTray);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if(process.platform != 'darwin') {
    app.quit();
  }
});

app.on('will-quit', function () {
  // This is a good place to add tests insuring the app is still
  // responsive and all windows are closed.
  console.log("will-quit");
  mainWindow = null;
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  console.log('y');
  if (mainWindow === null) {
    createWindow();
    createTray();
  } else {
    mainWindow.show();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
