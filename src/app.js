var gui = require('nw.gui');
var win = gui.Window.get();

var CustomNotification = require('./components/notification')(window.Notification, win.focus);
var platform = require('./components/platform');

// Check for update


// Create the app menu
var mainMenu = new gui.Menu({ type: 'menubar' });

if (platform.isOSX) {
  //mainMenu.items[0].submenu
  mainMenu.createMacBuiltin('Chatra');
}

win.menu = mainMenu;

// Windows
if (platform.isWindows) {
  // Create a tray icon
  var tray = new gui.Tray({ title: 'Chatra', icon: 'icon.png' });
  tray.on('click', function() {
    win.show();
  });

  // Add a menu to the tray
  var trayMenu = new gui.Menu();
  trayMenu.append(new gui.MenuItem({ label: 'Open Chatra', click: function() { win.show(); } }));
  trayMenu.append(new gui.MenuItem({ label: 'Quit Chatra', click: function() { win.close(true); } }));
  tray.menu = trayMenu;
}

// OS X
if (platform.isOSX) {
  // Re-show the window when the dock icon is pressed
  gui.App.on('reopen', function() {
    win.show();
  });
}

// Don't quit the app when the window is closed
win.on('close', function(quit) {
  if (quit) {
    win.close(true);
  } else {
    win.hide();
  }
});

// Open external urls in the browser
win.on('new-win-policy', function(frame, url, policy) {
  gui.Shell.openExternal(url);
  policy.ignore();
});

// Listen for DOM load
window.onload = function() {
  var app = document.getElementById('app');

  // Watch the iframe every 250ms to sync the title
  setInterval(function() {
    document.title = app.contentDocument.title;
  }, 250);

  // Set the badge update listener
  app.contentWindow.$window.on('unreadcount', function (event, count) {
    win.setBadgeLabel(count ? count : '');
  });

  // Change the Notification implementation inside the iframe
  //app.contentWindow.Notification = CustomNotification;
};
